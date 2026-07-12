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
}

const SECTION_LABELS: Record<HoldEntry["section"], string> = {
  subjective: "S",
  objective: "O",
  assessment: "A",
  plan: "P",
};

export function ReviewTray({ holds, activeIndex, onSelect, onConfirm, onDismiss }: Props) {
  if (holds.length === 0) return null;
  return (
    <div
      className="border-t border-border bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0D57FA]">
          Review ({holds.length})
        </div>
        <div className="text-[10px] text-muted-foreground">
          1 / 2 / 3 pick · Enter confirm · Esc dismiss
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto scrollbar-hide">
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(h.anchorId);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded border border-border bg-white text-muted-foreground hover:border-amber-500 hover:text-amber-700 transition-colors ml-auto"
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
}
