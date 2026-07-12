import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Span } from "./verify";
import {
  applyFormatToggles,
  FORMAT_TOGGLES,
  type FormatToggle,
} from "./format-options";

export interface HoldEntry {
  anchorId: string;
  section: "subjective" | "objective" | "assessment" | "plan";
  span: Span;
  start: number;
  end: number;
  rawText: string;
}

interface Props {
  holds: HoldEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onConfirm: (anchorId: string, choice: string) => void;
  onDismiss: (anchorId: string) => void;
  onLookup?: (query: string) => void;
  // NEW: full transcript context
  sectionText?: string;
  interim?: string;
  sectionLabel?: string;
}

const SECTION_LABELS: Record<HoldEntry["section"], string> = {
  subjective: "S",
  objective: "O",
  assessment: "A",
  plan: "P",
};

function renderTranscriptWithHighlights(
  text: string,
  holds: HoldEntry[],
  activeIndex: number,
  interim: string,
) {
  if (!text && !interim) {
    return (
      <span className="text-[#A3B0C8] italic">
        Transcript will appear here as you dictate…
      </span>
    );
  }

  // Sort holds by start; filter those inside text bounds
  const active = holds
    .filter((h) => h.start >= 0 && h.end <= text.length && h.end > h.start)
    .slice()
    .sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  active.forEach((h, i) => {
    if (h.start > cursor) {
      parts.push(
        <span key={`t-${cursor}`}>{text.slice(cursor, h.start)}</span>,
      );
    }
    const isActive = i === activeIndex;
    parts.push(
      <span
        key={`h-${h.anchorId}`}
        style={{
          background: isActive ? "#FFEFCC" : "#FFF7E6",
          border: `1px solid ${isActive ? "#E4B860" : "#F2E8C8"}`,
          color: "#8A6116",
          padding: "1px 4px",
          borderRadius: 4,
          fontWeight: 600,
        }}
        title={h.span.reason ?? h.span.type}
      >
        {h.rawText}
      </span>,
    );
    cursor = h.end;
  });
  if (cursor < text.length) {
    parts.push(<span key={`t-end`}>{text.slice(cursor)}</span>);
  }

  if (interim) {
    parts.push(
      <span
        key="interim"
        style={{ color: "#7A8AAC", fontStyle: "italic" }}
      >
        {(text.endsWith(" ") || text.length === 0 ? "" : " ") + interim}
      </span>,
    );
  }
  return parts;
}

export function ReviewTray({
  holds,
  activeIndex,
  onSelect,
  onConfirm,
  onDismiss,
  onLookup,
  sectionText = "",
  interim = "",
  sectionLabel,
}: Props) {
  const [portalReady, setPortalReady] = useState(false);
  const [toggles, setToggles] = useState<Set<FormatToggle>>(new Set());

  useEffect(() => setPortalReady(typeof document !== "undefined"), []);

  const displayText = useMemo(
    () => (toggles.size === 0 ? sectionText : applyFormatToggles(sectionText, toggles)),
    [sectionText, toggles],
  );
  // When formatting is applied, hold offsets in original text no longer map cleanly.
  // Fall back: don't highlight when any toggle is active.
  const highlightHolds = toggles.size === 0 ? holds : [];

  if (holds.length === 0 && !sectionText && !interim) return null;
  if (!portalReady) return null;

  const toggle = (id: FormatToggle) =>
    setToggles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const node = (
    <div
      className="fixed right-6 top-24 w-[380px] overflow-hidden rounded-xl border bg-white/95 pointer-events-auto flex flex-col"
      style={{
        zIndex: 9997,
        maxHeight: "calc(100vh - 8rem)",
        fontFamily: "'Inter', sans-serif",
        borderColor: "#D8E2F0",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow:
          "0 24px 64px -24px rgba(5,18,56,0.28), 0 8px 20px -12px rgba(5,18,56,0.18)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0D57FA]">
            Review
          </div>
          {sectionLabel && (
            <span className="text-[10px] font-semibold text-[#46587E] bg-[#F3F6FB] px-1.5 py-0.5 rounded">
              {sectionLabel}
            </span>
          )}
          {holds.length > 0 && (
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              {holds.length} to review
            </span>
          )}
        </div>
      </div>

      {/* Formatting toggles */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-1.5 flex-wrap flex-shrink-0">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
          Format
        </span>
        {FORMAT_TOGGLES.map((t) => {
          const on = toggles.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              title={t.description}
              className="text-[10px] px-2 py-0.5 rounded-full border transition-colors"
              style={{
                borderColor: on ? "#0D57FA" : "#D8E2F0",
                background: on ? "#EEF4FC" : "white",
                color: on ? "#0D57FA" : "#46587E",
                fontWeight: on ? 600 : 500,
              }}
            >
              {t.label}
            </button>
          );
        })}
        <button
          onClick={() => setToggles(new Set())}
          disabled={toggles.size === 0}
          className="text-[10px] px-2 py-0.5 rounded-full border transition-colors ml-auto"
          style={{
            borderColor: "#D8E2F0",
            background: "white",
            color: toggles.size === 0 ? "#C7D0DE" : "#46587E",
          }}
        >
          Original
        </button>
      </div>

      {/* Transcript with highlights */}
      <div
        className="px-4 py-3 border-b border-border overflow-y-auto scrollbar-hide"
        style={{ maxHeight: 220 }}
      >
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Transcript
        </div>
        <div
          className="text-[12px] leading-relaxed whitespace-pre-wrap"
          style={{ color: "#0B1F52", fontFamily: "'Inter', sans-serif" }}
        >
          {renderTranscriptWithHighlights(displayText, highlightHolds, activeIndex, interim)}
        </div>
      </div>

      {/* Hold cards */}
      {holds.length > 0 && (
        <div className="overflow-y-auto scrollbar-hide flex-1">
          <div className="px-4 pt-2 pb-1 flex items-center justify-between">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Items to resolve
            </div>
            <div className="text-[9px] text-muted-foreground">
              1/2/3 · Enter · Esc
            </div>
          </div>
          {holds.map((h, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={h.anchorId}
                onClick={() => onSelect(i)}
                className={`px-4 py-2 border-t border-border/60 cursor-pointer transition-colors ${
                  isActive ? "bg-white" : "bg-transparent hover:bg-white/60"
                }`}
                style={{
                  borderLeft: isActive ? "2px solid #0D57FA" : "2px solid transparent",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono font-semibold text-[#0D57FA] bg-[#EEF4FC] px-1.5 py-0.5 rounded">
                    {SECTION_LABELS[h.section]}
                  </span>
                  <span className="text-[11px] font-semibold text-foreground truncate">
                    “{h.rawText}”
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {h.span.reason ?? h.span.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {h.span.candidates.slice(0, 3).map((c, ci) => (
                    <button
                      key={ci}
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirm(h.anchorId, c);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded border border-border bg-white hover:border-[#0D57FA] hover:text-[#0D57FA] transition-colors"
                    >
                      <span className="text-[9px] font-mono text-muted-foreground mr-1">
                        {ci + 1}
                      </span>
                      {c}
                    </button>
                  ))}
                  {h.span.type === "med" && onLookup && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLookup(h.rawText);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded border border-border bg-white text-[#0D57FA] hover:border-[#0D57FA] hover:bg-[#EEF4FC] transition-colors ml-auto"
                    >
                      Lookup
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(h.anchorId);
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded border border-border bg-white text-muted-foreground hover:border-amber-500 hover:text-amber-700 transition-colors ${h.span.type === "med" && onLookup ? "" : "ml-auto"}`}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return createPortal(node, document.body);
}
