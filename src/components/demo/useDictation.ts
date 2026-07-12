import { useCallback, useEffect, useRef, useState } from "react";

export type DictationStatus = "idle" | "connecting" | "listening" | "error";

export interface DGWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
}

export interface UseDictationOptions {
  onInterim?: (text: string) => void;
  onFinal?: (
    text: string,
    words: DGWord[],
    meta: { speechFinal: boolean },
  ) => void;
  onUtteranceEnd?: () => void;
  onError?: (msg: string) => void;
}

// Latency-tuned: shorter endpointing, more aggressive utterance close.
const DG_URL =
  "wss://api.deepgram.com/v1/listen?model=nova-3-medical&language=en&smart_format=true&interim_results=true&dictation=true&numerals=true&punctuate=true&endpointing=180&utterance_end_ms=1000";

export function useDictation(opts: UseDictationOptions = {}) {
  const { onInterim, onFinal, onUtteranceEnd, onError } = opts;
  const optsRef = useRef({ onInterim, onFinal, onUtteranceEnd, onError });
  optsRef.current = { onInterim, onFinal, onUtteranceEnd, onError };

  const [status, setStatus] = useState<DictationStatus>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
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
    try {
      recorderRef.current?.state === "recording" && recorderRef.current.stop();
    } catch {}
    recorderRef.current = null;
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    streamRef.current = null;
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

  const stop = useCallback(() => {
    sessionRef.current += 1;
    stoppingRef.current = true;
    cleanup();
    setErrorMessage(null);
    setExpired(false);
    setDictationStatus("idle");
    stoppingRef.current = false;
  }, [cleanup, setDictationStatus]);

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
        setAudioLevel(smoothedLevelRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {}

    let socket: WebSocket;
    try {
      socket = new WebSocket(DG_URL, ["bearer", accessToken]);
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
        if (msg.is_final) {
          const now = Date.now();
          const last = lastFinalRef.current;
          if (last && last.text === transcript && now - last.at < 1500) return;
          lastFinalRef.current = { text: transcript, at: now };
          optsRef.current.onFinal?.(transcript, alt?.words ?? [], {
            speechFinal: Boolean(msg.speech_final),
          });
        } else {
          // Coalesce rapid interim events into the next animation frame.
          pendingInterimRef.current = transcript;
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
  }, [cleanup, fail, setDictationStatus]);

  useEffect(() => {
    return () => {
      stoppingRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  return { status, start, stop, audioLevel, expired, errorMessage };
}
