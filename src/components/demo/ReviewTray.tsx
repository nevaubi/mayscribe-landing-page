import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Span } from "./verify";

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
}

const SECTION_LABELS: Record<HoldEntry["section"], string> = {
  subjective: "S",
  objective: "O",
  assessment: "A",
  plan: "P",
};

export function ReviewTray({ holds, activeIndex, onSelect, onConfirm, onDismiss, onLookup }: Props) {
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(typeof document !== "undefined");
  }, []);

  if (holds.length === 0) return null;
  if (!portalReady) return null;

  const node = (
    <div
      className="fixed right-8 top-24 w-[360px] overflow-hidden rounded-xl border bg-white/95 pointer-events-auto"
      style={{
        zIndex: 9997,
        fontFamily: "'Inter', sans-serif",
        borderColor: "#D8E2F0",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow:
          "0 24px 64px -24px rgba(5,18,56,0.28), 0 8px 20px -12px rgba(5,18,56,0.18)",
      }}
    >
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0D57FA]">
          Review ({holds.length})
        </div>
        <div className="text-[10px] text-muted-foreground">
          1 / 2 / 3 pick · Enter confirm · Esc dismiss
        </div>
      </div>
      <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
        {holds.map((h, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={h.anchorId}
              onClick={() => onSelect(i)}
              className={`px-4 py-2.5 border-b border-border/60 cursor-pointer transition-colors ${
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
                <span className="text-[11px] font-semibold text-foreground">
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
    </div>
  );

  return createPortal(node, document.body);
}
