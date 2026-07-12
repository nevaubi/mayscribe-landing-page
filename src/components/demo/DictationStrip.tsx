import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, X } from "lucide-react";
import type { DictationStatus } from "./useDictation";
import { SmoothInterim } from "./SmoothInterim";

interface Props {
  status: DictationStatus;
  audioLevel: number;
  interim: string;
  section: string;
  startedAt: number | null;
  quietMsRemaining?: number | null;
  errorMessage: string | null;
  expired: boolean;
  lastCommit: string | null;
  onStop: () => void;
  /** Number of open holds — shown as blue badge on the F1 chip. */
  holdCount?: number;
  /** True when the review tray is closed. Enables the amber pulse. */
  reviewTrayClosed?: boolean;
}

const BAR_COUNT = 10;
const SECTION_LABEL: Record<string, string> = {
  subjective: "S · Subjective",
  objective: "O · Objective",
  assessment: "A · Assessment",
  plan: "P · Plan",
};

export function DictationStrip({
  status,
  audioLevel,
  interim,
  section,
  startedAt,
  quietMsRemaining,
  errorMessage,
  expired,
  onStop,
  holdCount = 0,
  reviewTrayClosed = true,
}: Props) {
  const visible = status !== "idle";
  const [portalReady, setPortalReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [elapsed, setElapsed] = useState("00:00");
  const [smoothed, setSmoothed] = useState(0);
  const smoothedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(0);
  targetRef.current = audioLevel;

  useEffect(() => setPortalReady(typeof document !== "undefined"), []);

  useEffect(() => {
    if (visible) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [visible]);

  // RAF-eased audio level for smooth waveform
  useEffect(() => {
    if (!visible) return;
    const tick = () => {
      const t = targetRef.current;
      const s = smoothedRef.current;
      const next = s + (t - s) * 0.22;
      smoothedRef.current = next;
      setSmoothed(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (!startedAt || status !== "listening") {
      setElapsed("00:00");
      return;
    }
    const tick = () => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      const mm = String(Math.floor(s / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      setElapsed(`${mm}:${ss}`);
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => clearInterval(id);
  }, [startedAt, status]);

  // Amber pulse on new hold while review tray closed.
  const [pulseKey, setPulseKey] = useState(0);
  const prevCountRef = useRef(holdCount);
  useEffect(() => {
    if (holdCount > prevCountRef.current && reviewTrayClosed) {
      setPulseKey((k) => k + 1);
    }
    prevCountRef.current = holdCount;
  }, [holdCount, reviewTrayClosed]);

  if (!portalReady || !visible) return null;

  const showError = status === "error";
  const dotColor = showError
    ? "#EF4444"
    : status === "connecting"
      ? "#F59E0B"
      : "#10B981";
  const label = showError
    ? expired
      ? "Session expired"
      : "Error"
    : status === "connecting"
      ? "Connecting"
      : "Listening";

  const quietCountdown =
    quietMsRemaining != null && status === "listening" && quietMsRemaining <= 2000
      ? Math.max(0, Math.ceil(quietMsRemaining / 1000))
      : null;

  const node = (
    <div
      className="fixed left-1/2 bottom-6 -translate-x-1/2 pointer-events-none"
      style={{
        zIndex: 9999,
        fontFamily: "'Inter', sans-serif",
        opacity: mounted ? 1 : 0,
        transform: `translate(-50%, ${mounted ? "0" : "6px"})`,
        transition: "opacity 180ms ease, transform 180ms ease",
      }}
    >
      <div
        className="pointer-events-auto rounded-full border bg-white/95"
        style={{
          borderColor: "#E6EEF8",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow:
            "0 20px 48px -20px rgba(5,18,56,0.30), 0 6px 16px -8px rgba(5,18,56,0.18)",
          width: "auto",
        }}
      >
        <div className="flex items-center gap-3 pl-3 pr-2 py-1.5">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#EEF6FF", color: "#0D57FA" }}
          >
            <Mic className="h-3.5 w-3.5" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              {status === "listening" && (
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                  style={{ background: dotColor }}
                />
              )}
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ background: dotColor }}
              />
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: showError ? "#B42318" : "#061338" }}
            >
              {label}
            </span>
          </div>

          <div
            className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded"
            style={{ color: "#46587E", background: "#F3F6FB" }}
          >
            {elapsed}
          </div>

          <div
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "#0D57FA" }}
          >
            {SECTION_LABEL[section] ?? section}
          </div>

          <div className="flex items-center gap-[3px] h-6 px-1 flex-shrink-0">
            {Array.from({ length: BAR_COUNT }).map((_, i) => {
              const phase = 0.55 + 0.45 * Math.sin((i / BAR_COUNT) * Math.PI * 1.4 + i * 0.4);
              const h = Math.max(3, Math.min(22, smoothed * 44 * phase + 3));
              return (
                <div
                  key={i}
                  style={{
                    width: 2.5,
                    height: `${h}px`,
                    borderRadius: 3,
                    background: "linear-gradient(180deg,#0B5DFF 0%,#0FD1D6 100%)",
                    opacity: status === "listening" ? 1 : 0.35,
                    transition: "height 60ms linear",
                  }}
                />
              );
            })}
          </div>

          {/* Fixed-width slot: quiet countdown OR error message. Prevents reflow. */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 72 }}
          >
            <div
              className="text-[10px] font-medium px-2 py-0.5 rounded-full truncate max-w-full text-center"
              style={{
                color: showError ? "#B42318" : "#8A6116",
                background: showError ? "#FEF2F2" : "#FFF7E6",
                border: `1px solid ${showError ? "#FECACA" : "#F2E8C8"}`,
                opacity: quietCountdown != null || (showError && errorMessage) ? 1 : 0,
                transition: "opacity 150ms ease",
              }}
            >
              {showError && errorMessage
                ? errorMessage
                : quietCountdown != null
                  ? `Quiet ${quietCountdown}s`
                  : "\u00A0"}
            </div>
          </div>

          <button
            onClick={onStop}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0"
            style={{ color: "#46587E" }}
            aria-label="Stop dictation (F2)"
            title="Stop (F2)"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
