import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { DictationStatus } from "./useDictation";

interface Props {
  status: DictationStatus;
  audioLevel: number;
  interim: string;
  startedAt: number | null;
  errorMessage: string | null;
  expired: boolean;
  onStop: () => void;
}

const BAR_COUNT = 20;

export function DictationStrip({
  status,
  audioLevel,
  interim,
  startedAt,
  errorMessage,
  expired,
  onStop,
}: Props) {
  const visible = status !== "idle";
  const [mounted, setMounted] = useState(false);
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (visible) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
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

  if (!visible) return null;

  const showError = status === "error";
  const label = showError
    ? expired
      ? "Session expired"
      : "Dictation error"
    : status === "connecting"
      ? "Connecting"
      : "Listening";

  const pillClass = showError
    ? "bg-red-50 text-red-700 border border-red-200"
    : status === "connecting"
      ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200";

  return (
    <div
      className="pointer-events-none absolute left-1/2 bottom-4 z-40 -translate-x-1/2"
      style={{
        fontFamily: "'Inter', sans-serif",
        opacity: mounted ? 1 : 0,
        transform: `translate(-50%, ${mounted ? "0" : "4px"})`,
        transition: "opacity 150ms ease, transform 150ms ease",
      }}
    >
      <div
        className="pointer-events-auto flex items-center gap-3 rounded-xl border bg-white px-3 py-2 shadow-[0_16px_36px_-12px_rgba(5,18,56,0.14)]"
        style={{ borderColor: "#C9D6EC", minWidth: 520, maxWidth: 720 }}
      >
        {/* Mark */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-5 w-5 rounded-md"
            style={{
              background: "linear-gradient(90deg,#0B5DFF 0%,#0FD1D6 100%)",
            }}
          />
          <span
            className="text-[12px] font-bold"
            style={{ color: "#061338", letterSpacing: "-0.01em" }}
          >
            MayScribe
          </span>
        </div>

        {/* Status pill */}
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${pillClass}`}
        >
          {label}
        </span>

        {/* Waveform */}
        <div className="flex items-center gap-[3px] h-6 px-1">
          {Array.from({ length: BAR_COUNT }).map((_, i) => {
            const phase = 0.6 + 0.4 * Math.sin((i / BAR_COUNT) * Math.PI);
            const h = Math.max(3, Math.min(24, audioLevel * 55 * phase + 3));
            return (
              <div
                key={i}
                style={{
                  width: 2.5,
                  height: `${h}px`,
                  borderRadius: 2,
                  background:
                    "linear-gradient(180deg,#0B5DFF 0%,#0FD1D6 100%)",
                  opacity: status === "listening" ? 1 : 0.4,
                  transition: "height 80ms linear",
                }}
              />
            );
          })}
        </div>

        {/* Elapsed */}
        <span
          className="text-[11px] font-mono tabular-nums"
          style={{ color: "#46587E" }}
        >
          {elapsed}
        </span>

        {/* Interim / error text — truncate from the left */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div
            className="text-[12px] italic text-right whitespace-nowrap overflow-hidden"
            style={{
              color: showError ? "#B42318" : "#7A8AAC",
              direction: "rtl",
              textOverflow: "ellipsis",
              unicodeBidi: "plaintext",
            }}
            title={showError ? (errorMessage ?? "") : interim}
          >
            {showError
              ? expired
                ? "press F2 to resume"
                : (errorMessage ?? "")
              : interim || (status === "listening" ? "…" : "")}
          </div>
        </div>

        {/* Stop */}
        <button
          onClick={onStop}
          className="ml-1 h-6 w-6 rounded-md border flex items-center justify-center hover:bg-slate-50 transition-colors"
          style={{ borderColor: "#D8E2F0", color: "#46587E" }}
          aria-label="Stop dictation"
          title="Stop"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
