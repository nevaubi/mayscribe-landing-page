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
  onFinal?: (text: string, words: DGWord[]) => void;
  onError?: (msg: string) => void;
}

const DG_URL =
  "wss://api.deepgram.com/v1/listen?model=nova-3-medical&language=en&smart_format=true&interim_results=true&dictation=true&numerals=true&punctuate=true&endpointing=300&utterance_end_ms=1200";

export function useDictation(opts: UseDictationOptions = {}) {
  const { onInterim, onFinal, onError } = opts;
  const optsRef = useRef({ onInterim, onFinal, onError });
  optsRef.current = { onInterim, onFinal, onError };

  const [status, setStatus] = useState<DictationStatus>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [expired, setExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelTimerRef = useRef<number | null>(null);
  const stoppingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (levelTimerRef.current) {
      clearInterval(levelTimerRef.current);
      levelTimerRef.current = null;
    }
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
    stoppingRef.current = true;
    cleanup();
    setStatus("idle");
    stoppingRef.current = false;
  }, [cleanup]);

  const fail = useCallback(
    (msg: string) => {
      setErrorMessage(msg);
      setStatus("error");
      optsRef.current.onError?.(msg);
      cleanup();
    },
    [cleanup],
  );

  const start = useCallback(async () => {
    if (status === "connecting" || status === "listening") return;
    setErrorMessage(null);
    setExpired(false);
    setStatus("connecting");

    // 1) token
    let accessToken: string;
    try {
      const res = await fetch("/api/deepgram-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`token ${res.status}`);
      const j = (await res.json()) as { access_token: string };
      accessToken = j.access_token;
    } catch (e) {
      fail("Dictation unavailable — retry");
      return;
    }

    // 2) mic
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (e: unknown) {
      const err = e as { name?: string };
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        fail("Microphone blocked — enable it in the browser bar");
      } else {
        fail("Microphone unavailable");
      }
      return;
    }
    streamRef.current = stream;

    // Audio analyser for level
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
      src.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      levelTimerRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        setAudioLevel(Math.min(1, rms * 2.2));
      }, 66);
    } catch {}

    // 3) socket
    let socket: WebSocket;
    try {
      socket = new WebSocket(DG_URL, ["token", accessToken]);
    } catch {
      fail("Dictation unavailable — retry");
      return;
    }
    socketRef.current = socket;
    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
      setStatus("listening");
      try {
        const mimeType = "audio/webm;codecs=opus";
        const rec = new MediaRecorder(stream, { mimeType });
        recorderRef.current = rec;
        rec.ondataavailable = (ev) => {
          if (
            ev.data &&
            ev.data.size > 0 &&
            socket.readyState === WebSocket.OPEN
          ) {
            socket.send(ev.data);
          }
        };
        rec.start(250);
      } catch {
        fail("Recorder unsupported in this browser");
      }
    };

    socket.onmessage = (ev) => {
      if (typeof ev.data !== "string") return;
      let msg: {
        type?: string;
        is_final?: boolean;
        channel?: {
          alternatives?: Array<{ transcript?: string; words?: DGWord[] }>;
        };
      };
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.type === "Results") {
        const alt = msg.channel?.alternatives?.[0];
        const transcript = (alt?.transcript || "").trim();
        if (!transcript) return;
        if (msg.is_final) {
          optsRef.current.onFinal?.(transcript, alt?.words ?? []);
        } else {
          optsRef.current.onInterim?.(transcript);
        }
      }
    };

    socket.onerror = () => {
      if (stoppingRef.current) return;
      fail("Dictation connection error");
    };

    socket.onclose = (ev) => {
      if (stoppingRef.current) return;
      if (ev.code === 1008 || ev.code === 4001 || ev.code === 4008) {
        setExpired(true);
        fail("Session expired — press F2 to resume");
        return;
      }
      // unexpected close
      cleanup();
      setStatus("idle");
    };
  }, [cleanup, fail, status]);

  useEffect(() => {
    return () => {
      stoppingRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  return { status, start, stop, audioLevel, expired, errorMessage };
}
