import { useCallback, useEffect, useRef, useState } from "react";
import { pcmInt16ToWav, concatInt16 } from "./pcmToWav";

export type DictationStatus = "idle" | "connecting" | "listening" | "error";

export interface DGWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
}

export interface BatchTranscriptResult {
  batchText: string;
  streamedText: string;
}

export interface UseDictationOptions {
  onInterim?: (text: string) => void;
  onFinal?: (
    text: string,
    words: DGWord[],
    meta: { speechFinal: boolean; start?: number; duration?: number },
  ) => void;
  onUtteranceEnd?: () => void;
  onError?: (msg: string) => void;
  onQuietStop?: () => void;
  onBatchTranscript?: (r: BatchTranscriptResult) => void;
}

// Latency-tuned: shorter endpointing, more aggressive utterance close.
const DG_URL_BASE =
  "wss://api.deepgram.com/v1/listen?model=nova-3-medical&language=en&smart_format=true&interim_results=true&dictation=true&numerals=true&punctuate=true&endpointing=180&utterance_end_ms=1000";
const DG_URL_PCM =
  DG_URL_BASE + "&encoding=linear16&sample_rate=16000&channels=1";

const QUIET_CLOSE_MS = 2000;
const QUIET_LEVEL_THRESHOLD = 0.025;
// ~10 min at 16kHz mono int16 = 9.6M samples.
const PCM_BUFFER_CAP_SAMPLES = 16000 * 60 * 10;

function wordsForLedger(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function diffAgainstLedger(transcript: string, ledger: string) {
  if (!ledger) return transcript;
  const ledgerWords = wordsForLedger(ledger);
  const transcriptWords = wordsForLedger(transcript);
  if (!ledgerWords.length || !transcriptWords.length) return transcript;

  const ledgerKey = ledgerWords.join(" ");
  const transcriptKey = transcriptWords.join(" ");
  if (ledgerKey.endsWith(transcriptKey)) return "";

  const startsWithLedger = ledgerWords.every(
    (word, index) => transcriptWords[index] === word,
  );
  if (startsWithLedger && transcriptWords.length > ledgerWords.length) {
    return transcript.split(/\s+/).slice(ledgerWords.length).join(" ").trim();
  }

  return transcript;
}

export function useDictation(opts: UseDictationOptions = {}) {
  const { onInterim, onFinal, onUtteranceEnd, onError, onQuietStop, onBatchTranscript } = opts;
  const optsRef = useRef({
    onInterim,
    onFinal,
    onUtteranceEnd,
    onError,
    onQuietStop,
    onBatchTranscript,
  });
  optsRef.current = { onInterim, onFinal, onUtteranceEnd, onError, onQuietStop, onBatchTranscript };

  const [status, setStatus] = useState<DictationStatus>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [quietMsRemaining, setQuietMsRemaining] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusRef = useRef<DictationStatus>("idle");
  const sessionRef = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedLevelRef = useRef(0);
  const stoppingRef = useRef(false);
  const lastFinalRef = useRef<{ text: string; at: number } | null>(null);
  const finalLedgerRef = useRef("");
  const lastFinalEndRef = useRef(0);
  const quietSinceRef = useRef<number | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pcmBufferRef = useRef<Int16Array[]>([]);
  const pcmBufferSamplesRef = useRef(0);

  // RAF-batched interim delivery to keep popup smooth.
  const pendingInterimRef = useRef<string | null>(null);
  const interimRafRef = useRef<number | null>(null);

  const setDictationStatus = useCallback((next: DictationStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (interimRafRef.current) {
      cancelAnimationFrame(interimRafRef.current);
      interimRafRef.current = null;
    }
    pendingInterimRef.current = null;
    smoothedLevelRef.current = 0;
    quietSinceRef.current = null;
    setQuietMsRemaining(null);
    try {
      recorderRef.current?.state === "recording" && recorderRef.current.stop();
    } catch {}
    recorderRef.current = null;
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    streamRef.current = null;
    try {
      workletNodeRef.current?.port.close();
      workletNodeRef.current?.disconnect();
    } catch {}
    workletNodeRef.current = null;
    try {
      sourceNodeRef.current?.disconnect();
    } catch {}
    sourceNodeRef.current = null;
    try {
      analyserRef.current?.disconnect();
    } catch {}
    analyserRef.current = null;
    try {
      audioCtxRef.current?.close();
    } catch {}
    audioCtxRef.current = null;
    try {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(JSON.stringify({ type: "CloseStream" }));
      }
      socketRef.current?.close();
    } catch {}
    socketRef.current = null;
    setAudioLevel(0);
  }, []);

  const fireBatchTranscribe = useCallback(() => {
    const cb = optsRef.current.onBatchTranscript;
    const chunks = pcmBufferRef.current;
    const total = pcmBufferSamplesRef.current;
    pcmBufferRef.current = [];
    pcmBufferSamplesRef.current = 0;
    if (!cb || total < 16000) return; // <1s of audio — skip
    const streamedText = finalLedgerRef.current;
    void (async () => {
      try {
        const pcm = concatInt16(chunks);
        const wav = pcmInt16ToWav(pcm, 16000);
        const form = new FormData();
        form.append("file", wav, "audio.wav");
        const res = await fetch("/api/batch-transcribe", {
          method: "POST",
          body: form,
        });
        if (!res.ok) return;
        const j = (await res.json()) as { text?: string };
        if (typeof j.text === "string" && j.text.trim()) {
          cb({ batchText: j.text, streamedText });
        }
      } catch {
        // silent — batch is a best-effort cross-check
      }
    })();
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    stoppingRef.current = true;
    fireBatchTranscribe();
    cleanup();
    setErrorMessage(null);
    setExpired(false);
    setDictationStatus("idle");
    stoppingRef.current = false;
  }, [cleanup, setDictationStatus, fireBatchTranscribe]);

  const fail = useCallback(
    (sessionId: number, msg: string, isExpired = false) => {
      if (sessionId !== sessionRef.current) return;
      sessionRef.current += 1;
      stoppingRef.current = true;
      cleanup();
      stoppingRef.current = false;
      setErrorMessage(msg);
      setExpired(isExpired);
      setDictationStatus("error");
      optsRef.current.onError?.(msg);
    },
    [cleanup, setDictationStatus],
  );

  const start = useCallback(async () => {
    if (
      statusRef.current === "connecting" ||
      statusRef.current === "listening"
    ) {
      return;
    }

    cleanup();
    const sessionId = sessionRef.current + 1;
    sessionRef.current = sessionId;
    stoppingRef.current = false;
    setErrorMessage(null);
    setExpired(false);
    lastFinalRef.current = null;
    finalLedgerRef.current = "";
    lastFinalEndRef.current = 0;
    quietSinceRef.current = null;
    setQuietMsRemaining(null);
    setDictationStatus("connecting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (e: unknown) {
      const err = e as { name?: string };
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        fail(sessionId, "Microphone blocked — enable it in the browser bar");
      } else if (err?.name === "NotFoundError") {
        fail(sessionId, "No microphone found");
      } else if (err?.name === "NotReadableError") {
        fail(sessionId, "Microphone is in use by another app");
      } else {
        fail(sessionId, "Microphone unavailable");
      }
      return;
    }

    if (sessionId !== sessionRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    streamRef.current = stream;

    let accessToken: string;
    try {
      const res = await fetch("/api/deepgram-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`token ${res.status}`);
      const j = JSON.parse(text) as { access_token?: string };
      if (!j.access_token) throw new Error("missing token");
      accessToken = j.access_token;
    } catch (e) {
      console.error("[dictation] token fetch error", e);
      fail(sessionId, "Dictation unavailable — retry");
      return;
    }

    if (sessionId !== sessionRef.current) return;

    // RAF-driven audio level sampler for smooth 60fps waveform.
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = src;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      src.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        const target = Math.min(1, rms * 2.4);
        // Ease toward target for glide-y bars
        smoothedLevelRef.current +=
          (target - smoothedLevelRef.current) * 0.35;
        const level = smoothedLevelRef.current;
        setAudioLevel(level);

        if (statusRef.current === "listening") {
          const now = Date.now();
          if (level < QUIET_LEVEL_THRESHOLD) {
            quietSinceRef.current ??= now;
            const remaining = Math.max(
              0,
              QUIET_CLOSE_MS - (now - quietSinceRef.current),
            );
            setQuietMsRemaining(remaining);
            if (remaining <= 0) {
              optsRef.current.onQuietStop?.();
              stop();
              return;
            }
          } else {
            quietSinceRef.current = null;
            setQuietMsRemaining(null);
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {}

    // Try to bring up the AudioWorklet PCM path. If anything fails we fall
    // back to the MediaRecorder/opus path further down.
    let useWorklet = false;
    try {
      const ctx = audioCtxRef.current;
      const src = sourceNodeRef.current;
      if (ctx && src) {
        await ctx.audioWorklet.addModule("/pcm-worklet.js");
        const node = new AudioWorkletNode(ctx, "pcm-downsampler-16k", {
          numberOfInputs: 1,
          numberOfOutputs: 0,
          channelCount: 1,
        });
        src.connect(node);
        workletNodeRef.current = node;
        useWorklet = true;
      }
    } catch (e) {
      console.warn("[dictation] worklet unavailable, falling back to opus", e);
      useWorklet = false;
    }

    if (sessionId !== sessionRef.current) return;

    const dgUrl = useWorklet ? DG_URL_PCM : DG_URL_BASE;
    let socket: WebSocket;
    try {
      socket = new WebSocket(dgUrl, ["bearer", accessToken]);
    } catch {
      fail(sessionId, "Dictation unavailable — retry");
      return;
    }
    socketRef.current = socket;
    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
      if (sessionId !== sessionRef.current) {
        socket.close();
        return;
      }
      setDictationStatus("listening");

      if (useWorklet && workletNodeRef.current) {
        workletNodeRef.current.port.onmessage = (ev: MessageEvent) => {
          if (
            sessionId !== sessionRef.current ||
            socket.readyState !== WebSocket.OPEN
          )
            return;
          const buf = ev.data as ArrayBuffer;
          if (buf && buf.byteLength) socket.send(buf);
        };
        return;
      }

      try {
        const preferredType = "audio/webm;codecs=opus";
        const mimeType = MediaRecorder.isTypeSupported(preferredType)
          ? preferredType
          : "audio/webm";
        const rec = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 32000,
        });
        recorderRef.current = rec;
        rec.ondataavailable = (ev) => {
          if (
            ev.data &&
            ev.data.size > 0 &&
            sessionId === sessionRef.current &&
            socket.readyState === WebSocket.OPEN
          ) {
            socket.send(ev.data);
          }
        };
        // Smaller timeslice = faster interim delivery.
        rec.start(80);
      } catch {
        fail(sessionId, "Recorder unsupported in this browser");
      }
    };

    socket.onmessage = (ev) => {
      if (sessionId !== sessionRef.current) return;
      if (typeof ev.data !== "string") return;
      let msg: {
        type?: string;
        is_final?: boolean;
        speech_final?: boolean;
        start?: number;
        duration?: number;
        channel?: {
          alternatives?: Array<{ transcript?: string; words?: DGWord[] }>;
        };
      };
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.type === "UtteranceEnd") {
        optsRef.current.onUtteranceEnd?.();
        return;
      }
      if (msg.type === "Results") {
        const alt = msg.channel?.alternatives?.[0];
        const transcript = (alt?.transcript || "").trim();
        if (!transcript) return;
        const startSec = typeof msg.start === "number" ? msg.start : undefined;
        const durationSec =
          typeof msg.duration === "number" ? msg.duration : undefined;
        const endSec =
          startSec != null && durationSec != null ? startSec + durationSec : undefined;
        if (msg.is_final) {
          if (endSec != null && endSec <= lastFinalEndRef.current + 0.04) {
            return;
          }
          const deltaText = diffAgainstLedger(transcript, finalLedgerRef.current);
          if (!deltaText) return;
          const now = Date.now();
          const last = lastFinalRef.current;
          if (last && last.text === deltaText && now - last.at < 1500) return;
          lastFinalRef.current = { text: deltaText, at: now };
          finalLedgerRef.current = finalLedgerRef.current
            ? `${finalLedgerRef.current} ${deltaText}`
            : transcript;
          if (endSec != null) {
            lastFinalEndRef.current = Math.max(lastFinalEndRef.current, endSec);
          }
          optsRef.current.onFinal?.(deltaText, alt?.words ?? [], {
            speechFinal: Boolean(msg.speech_final),
            start: startSec,
            duration: durationSec,
          });
        } else {
          if (endSec != null && endSec <= lastFinalEndRef.current + 0.04) {
            return;
          }
          const interimDelta =
            diffAgainstLedger(transcript, finalLedgerRef.current) || transcript;
          // Coalesce rapid interim events into the next animation frame.
          pendingInterimRef.current = interimDelta;
          if (interimRafRef.current == null) {
            interimRafRef.current = requestAnimationFrame(() => {
              interimRafRef.current = null;
              const t = pendingInterimRef.current;
              pendingInterimRef.current = null;
              if (t != null) optsRef.current.onInterim?.(t);
            });
          }
        }
      }
    };

    socket.onerror = (ev) => {
      console.error("[dictation] socket error", ev);
      if (stoppingRef.current || sessionId !== sessionRef.current) return;
      fail(sessionId, "Dictation connection error");
    };

    socket.onclose = (ev) => {
      if (stoppingRef.current || sessionId !== sessionRef.current) return;
      if (ev.code === 1008 || ev.code === 4001 || ev.code === 4008) {
        fail(sessionId, "Session expired — press F2 to resume", true);
        return;
      }
      if (ev.code !== 1000 && ev.code !== 1005) {
        fail(sessionId, "Dictation disconnected — press F2 to retry");
        return;
      }
      cleanup();
      setDictationStatus("idle");
    };
  }, [cleanup, fail, setDictationStatus, stop]);

  useEffect(() => {
    return () => {
      stoppingRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    start,
    stop,
    audioLevel,
    quietMsRemaining,
    expired,
    errorMessage,
  };
}
