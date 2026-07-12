import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, X } from "lucide-react";
import type { DictationStatus } from "./useDictation";

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
}

const BAR_COUNT = 14;
const SECTION_LABEL: Record<string, string> = {
  subjective: "S — Subjective",
  objective: "O — Objective",
  assessment: "A — Assessment",
  plan: "P — Plan",
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
  lastCommit,
  onStop,
}: Props) {
  const visible = status !== "idle";
  const [portalReady, setPortalReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [elapsed, setElapsed] = useState("00:00");
  const [flashCommit, setFlashCommit] = useState<string | null>(null);
  const commitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setPortalReady(typeof document !== "undefined");
  }, []);

  useEffect(() => {
    if (visible) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [visible]);

  useEffect(() => {
    if (!lastCommit) return;
    setFlashCommit(lastCommit);
    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = window.setTimeout(() => setFlashCommit(null), 700);
    return () => {
      if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    };
  }, [lastCommit]);

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

  const previewText = flashCommit ?? interim;
  const quietCountdown =
    quietMsRemaining != null && status === "listening"
      ? Math.ceil(quietMsRemaining / 1000)
      : null;

  const node = (
    <div
      className="fixed left-1/2 bottom-8 -translate-x-1/2 pointer-events-none"
      style={{
        zIndex: 9999,
        fontFamily: "'Inter', sans-serif",
        opacity: mounted ? 1 : 0,
        transform: `translate(-50%, ${mounted ? "0" : "6px"})`,
        transition: "opacity 180ms ease, transform 180ms ease",
      }}
    >
      <div
        className="pointer-events-auto rounded-2xl border bg-white/95"
        style={{
          borderColor: "#E6EEF8",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow:
            "0 20px 48px -16px rgba(5,18,56,0.20), 0 4px 12px -4px rgba(5,18,56,0.10)",
          boxShadow:
            "0 28px 72px -24px rgba(5,18,56,0.28), 0 10px 22px -12px rgba(5,18,56,0.18)",
          width: "min(760px, calc(100vw - 48px))",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#EEF6FF", color: "#0D57FA" }}
          >
            <Mic className="h-4 w-4" />
          </div>

          <div className="min-w-[120px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {status === "listening" && (
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                    style={{ background: dotColor }}
                  />
                )}
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: dotColor }}
                />
              </span>
              <span
                className="text-[12px] font-semibold"
                style={{ color: showError ? "#B42318" : "#061338" }}
              >
                {label}
              </span>
              <span
                className="text-[11px] font-mono tabular-nums"
                style={{ color: "#7A8AAC" }}
              >
                {elapsed}
              </span>
            </div>
            <div
              className="mt-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#0D57FA" }}
            >
              {SECTION_LABEL[section] ?? section}
            </div>
          </div>

          <div className="flex items-center gap-[3px] h-8 px-1 flex-shrink-0">
            {Array.from({ length: BAR_COUNT }).map((_, i) => {
              const phase = 0.55 + 0.45 * Math.sin((i / BAR_COUNT) * Math.PI);
              const h = Math.max(3, Math.min(28, audioLevel * 56 * phase + 3));
              return (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: `${h}px`,
                    borderRadius: 3,
                    background:
                      "linear-gradient(180deg,#0B5DFF 0%,#0FD1D6 100%)",
                    opacity: status === "listening" ? 1 : 0.35,
                    transition: "height 90ms linear",
                  }}
                />
              );
            })}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="text-[12px] whitespace-nowrap overflow-hidden text-ellipsis rounded-md px-2 py-1 transition-colors"
              style={{
                color: showError
                  ? "#B42318"
                  : flashCommit
                    ? "#061338"
                    : "#46587E",
                background: flashCommit ? "#EEF4FC" : "#F8FBFF",
                border: "1px solid #E6EEF8",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              title={showError ? (errorMessage ?? "") : previewText}
            >
              {showError
                ? expired
                  ? "Session expired — press F2 to resume"
                  : (errorMessage ?? "")
                : previewText
                  ? previewText.length > 108
                    ? "…" + previewText.slice(-108)
                    : previewText
                  : status === "listening"
                    ? "Listening for speech…"
                    : "Preparing microphone…"}
            </div>
            {quietCountdown != null && quietCountdown <= 2 && (
              <div className="mt-1 text-[10px] font-medium" style={{ color: "#8A6116" }}>
                Quiet detected — closing in {quietCountdown}s
              </div>
            )}
          </div>

          <button
            onClick={onStop}
            className="h-8 w-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 transition-colors flex-shrink-0"
            style={{ borderColor: "#D8E2F0", color: "#46587E" }}
            aria-label="Stop dictation (F2)"
            title="Stop (F2)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                style={{ background: dotColor }}
              />
            )}
            <span
              className="relative inline-flex rounded-full h-2 w-2"
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

        {/* Timer */}
        <span
          className="text-[11px] font-mono tabular-nums"
          style={{ color: "#7A8AAC" }}
        >
          {elapsed}
        </span>

        {/* Section chip */}
        <span
          className="text-[10px] font-semibold uppercase tracking-wider rounded-md px-1.5 py-0.5"
          style={{
            background: "#EEF6FF",
            color: "#0D57FA",
            border: "1px solid #D8E7FF",
          }}
        >
          {SECTION_LABEL[section] ?? section}
        </span>

        {/* Waveform */}
        <div className="flex items-center gap-[3px] h-5 px-1">
          {Array.from({ length: BAR_COUNT }).map((_, i) => {
            const phase = 0.55 + 0.45 * Math.sin((i / BAR_COUNT) * Math.PI);
            const h = Math.max(2, Math.min(20, audioLevel * 44 * phase + 2));
            return (
              <div
                key={i}
                style={{
                  width: 2.5,
                  height: `${h}px`,
                  borderRadius: 2,
                  background:
                    "linear-gradient(180deg,#0B5DFF 0%,#0FD1D6 100%)",
                  opacity: status === "listening" ? 1 : 0.35,
                }}
              />
            );
          })}
        </div>

        {/* Preview */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div
            className="text-[12px] whitespace-nowrap overflow-hidden text-ellipsis text-right rounded px-1.5 py-0.5 transition-colors"
            style={{
              color: showError
                ? "#B42318"
                : flashCommit
                  ? "#061338"
                  : "#7A8AAC",
              fontStyle: flashCommit ? "normal" : "italic",
              background: flashCommit ? "#EEF4FC" : "transparent",
              fontFamily: "'JetBrains Mono', monospace",
            }}
            title={showError ? (errorMessage ?? "") : previewText}
          >
            {showError
              ? expired
                ? "press F2 to resume"
                : (errorMessage ?? "")
              : previewText
                ? previewText.length > 96
                  ? "…" + previewText.slice(-96)
                  : previewText
                : status === "listening"
                  ? "…"
                  : ""}
          </div>
        </div>

        {/* Stop */}
        <button
          onClick={onStop}
          className="h-6 w-6 rounded-md border flex items-center justify-center hover:bg-slate-50 transition-colors"
          style={{ borderColor: "#D8E2F0", color: "#46587E" }}
          aria-label="Stop dictation (F2)"
          title="Stop (F2)"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
