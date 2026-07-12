import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Span } from "./verify";
import {
  applyFormatToggles,
  applyDeterministicFormat,
  deterministicClean,
  toAppliedPlainText,
  FORMAT_TOGGLES,
  type FormatToggle,
} from "./format-options";
import { verifyIntegrity } from "./formatIntegrity";
import { formatAssist } from "@/lib/format-assist.functions";
import { SmoothInterim } from "./SmoothInterim";

const PANEL_WIDTH = 420;
const EDGE_MARGIN = 24;
const MIN_VISIBLE = 40;

export interface HoldEntry {
  anchorId: string;
  section: "subjective" | "objective" | "assessment" | "plan";
  span: Span;
  start: number;
  end: number;
  rawText: string;
}

type SectionKey = HoldEntry["section"];

interface Props {
  holds: HoldEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onConfirm: (anchorId: string, choice: string) => void;
  onDismiss: (anchorId: string) => void;
  onLookup?: (query: string) => void;
  sectionText?: string;
  interim?: string;
  sectionLabel?: string;
  activeSection?: SectionKey;
  onApplyFormatted?: (section: SectionKey, plainText: string) => void;
  onUndoFormat?: () => void;
  canUndoFormat?: boolean;
}

const SECTION_LABELS: Record<SectionKey, string> = {
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
  const active = holds
    .filter((h) => h.start >= 0 && h.end <= text.length && h.end > h.start)
    .slice()
    .sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  active.forEach((h, i) => {
    if (h.start > cursor) {
      parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, h.start)}</span>);
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
    const needsSpace = !(text.endsWith(" ") || text.length === 0);
    parts.push(
      <SmoothInterim
        key="interim"
        target={interim}
        prefix={needsSpace ? " " : ""}
        style={{ color: "#7A8AAC", fontStyle: "italic" }}
        rightAnchor={false}
      />,
    );
  }
  return parts;
}

// Render markdownish text with **bold**, "# HEADER" and "- bullet" as real
// preview styles. Preview-only — never persisted.
function renderPreview(text: string, changedLines: Set<number>) {
  const lines = text.split("\n");
  return lines.map((ln, i) => {
    const changed = changedLines.has(i);
    const bg = changed ? "rgba(13,87,250,0.06)" : "transparent";

    const headerMatch = ln.match(/^\s*#{1,6}\s+(.*)$/);
    if (headerMatch) {
      return (
        <div key={i} style={{ background: bg, padding: "1px 4px", borderRadius: 3 }}>
          <span
            style={{
              fontWeight: 700,
              color: "#061338",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              fontSize: 11,
            }}
          >
            {headerMatch[1]}
          </span>
        </div>
      );
    }

    const bulletMatch = ln.match(/^\s*[-•]\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div
          key={i}
          style={{
            background: bg,
            padding: "1px 4px 1px 14px",
            borderRadius: 3,
            position: "relative",
          }}
        >
          <span style={{ position: "absolute", left: 2, color: "#46587E" }}>•</span>
          {renderBold(bulletMatch[1]!)}
        </div>
      );
    }

    if (ln.trim() === "") {
      return <div key={i} style={{ height: 6 }} />;
    }

    return (
      <div key={i} style={{ background: bg, padding: "1px 4px", borderRadius: 3 }}>
        {renderBold(ln)}
      </div>
    );
  });
}

function renderBold(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <strong key={k++} style={{ color: "#061338", fontWeight: 700 }}>
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function diffChangedLines(before: string, after: string): Set<number> {
  const a = new Set(before.split("\n").map((s) => s.trim()));
  const changed = new Set<number>();
  after.split("\n").forEach((ln, i) => {
    if (ln.trim() && !a.has(ln.trim())) changed.add(i);
  });
  return changed;
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
  activeSection,
  onApplyFormatted,
  onUndoFormat,
  canUndoFormat,
}: Props) {
  const [portalReady, setPortalReady] = useState(false);
  const [tab, setTab] = useState<"items" | "format">("items");
  const [toggles, setToggles] = useState<Set<FormatToggle>>(
    () =>
      new Set<FormatToggle>([
        "punctuation",
        "sentenceCase",
        "unitsAndAbbrev",
        "abbrevPlus",
        "spelling",
        "structure",
      ]),
  );
  const [preview, setPreview] = useState<{ before: string; after: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    setPortalReady(typeof document !== "undefined");
    if (typeof window !== "undefined" && pos === null) {
      setPos({
        x: Math.max(EDGE_MARGIN, window.innerWidth - PANEL_WIDTH - EDGE_MARGIN),
        y: 96,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const { dx, dy } = dragRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const nx = Math.min(w - MIN_VISIBLE, Math.max(MIN_VISIBLE - PANEL_WIDTH, e.clientX - dx));
    const ny = Math.min(h - MIN_VISIBLE, Math.max(0, e.clientY - dy));
    setPos({ x: nx, y: ny });
  };
  const onHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  // Items-tab display formatting is derived from deterministic toggles only.
  const displayText = useMemo(() => {
    const det = new Set<FormatToggle>();
    (["punctuation", "unitsAndAbbrev", "sentenceCase", "abbrevPlus", "paragraphs"] as FormatToggle[])
      .forEach((t) => { if (toggles.has(t)) det.add(t); });
    return det.size === 0 ? sectionText : applyFormatToggles(sectionText, det);
  }, [sectionText, toggles]);
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

  async function runFormatPipeline() {
    setBusy(true);
    setWarning(null);
    try {
      const det = new Set<FormatToggle>();
      (["punctuation", "unitsAndAbbrev", "sentenceCase", "abbrevPlus", "paragraphs"] as FormatToggle[])
        .forEach((t) => { if (toggles.has(t)) det.add(t); });

      // Pre-clean: always-safe spacing/punctuation normalization.
      let out = deterministicClean(sectionText);
      out = applyDeterministicFormat(out, det);

      const wantLLM = toggles.has("spelling") || toggles.has("structure");
      if (wantLLM) {
        const res = await formatAssist({
          data: {
            text: out,
            toggles: {
              spelling: toggles.has("spelling"),
              structure: toggles.has("structure"),
            },
          },
        });
        if (res.ok && verifyIntegrity(out, res.formatted)) {
          out = res.formatted;
        } else {
          setWarning("Structure formatting unavailable for this pass.");
        }
      }

      // Post-clean: normalize any spacing the LLM (or deterministic pass) left.
      out = deterministicClean(out);

      setPreview({ before: sectionText, after: out });
    } finally {
      setBusy(false);
    }
  }

  function applyPreview() {
    if (!preview || !activeSection || !onApplyFormatted) return;
    const plain = toAppliedPlainText(preview.after);
    onApplyFormatted(activeSection, plain);
    setPreview(null);
    setWarning(null);
  }

  const changedLines = preview ? diffChangedLines(preview.before, preview.after) : new Set<number>();

  const node = (
    <div
      className="fixed overflow-hidden rounded-xl border bg-white/95 pointer-events-auto flex flex-col"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 96,
        width: PANEL_WIDTH,
        visibility: pos ? "visible" : "hidden",
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
      {/* Header (drag handle) */}
      <div
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        onPointerCancel={onHeaderPointerUp}
        className="px-4 py-2 border-b border-border flex items-center justify-between flex-shrink-0 select-none"
        style={{ cursor: dragRef.current ? "grabbing" : "grab", touchAction: "none" }}
      >
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
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">drag</span>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border flex-shrink-0" data-no-drag>
        {(["items", "format"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 text-[11px] font-semibold py-2 transition-colors uppercase tracking-wider"
            style={{
              color: tab === t ? "#0D57FA" : "#7A8AAC",
              borderBottom: tab === t ? "2px solid #0D57FA" : "2px solid transparent",
              background: tab === t ? "#F8FBFF" : "transparent",
            }}
          >
            {t === "items" ? `Items${holds.length ? ` · ${holds.length}` : ""}` : "Format"}
          </button>
        ))}
      </div>

      {tab === "items" && (
        <>
          {/* Display-format chips (deterministic-only, view of transcript) */}
          <div className="px-4 py-2 border-b border-border flex items-center gap-1.5 flex-wrap flex-shrink-0">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              View
            </span>
            {FORMAT_TOGGLES.filter((t) => !t.ai).map((t) => {
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
        </>
      )}

      {tab === "format" && (
        <div className="flex flex-col overflow-hidden">
          {/* Toggle chips */}
          <div className="px-4 py-2 border-b border-border flex items-center gap-1.5 flex-wrap flex-shrink-0">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              Toggles
            </span>
            {FORMAT_TOGGLES.map((t) => {
              const on = toggles.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  title={t.description}
                  className="text-[10px] px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1"
                  style={{
                    borderColor: on ? "#0D57FA" : "#D8E2F0",
                    background: on ? "#EEF4FC" : "white",
                    color: on ? "#0D57FA" : "#46587E",
                    fontWeight: on ? 600 : 500,
                  }}
                >
                  {t.ai && (
                    <span
                      style={{
                        width: 5, height: 5, borderRadius: 999,
                        background: on ? "#0D57FA" : "#7A8AAC",
                        display: "inline-block",
                      }}
                    />
                  )}
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2 border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="text-[10px] text-[#46587E]">
              Active section: <span className="font-semibold text-[#061338]">{sectionLabel ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {canUndoFormat && onUndoFormat && (
                <button
                  onClick={onUndoFormat}
                  className="text-[10px] px-2 py-0.5 rounded border border-border bg-white text-[#46587E] hover:border-[#0D57FA] hover:text-[#0D57FA] transition-colors"
                >
                  Undo
                </button>
              )}
              <button
                onClick={runFormatPipeline}
                disabled={busy || (!sectionText && toggles.size === 0)}
                className="text-[10px] px-2.5 py-1 rounded transition-colors font-medium"
                style={{
                  background: busy ? "#C7D0DE" : "#0D57FA",
                  color: "white",
                  cursor: busy ? "wait" : "pointer",
                }}
              >
                {busy ? "Formatting…" : "Format section"}
              </button>
            </div>
          </div>

          {warning && (
            <div className="px-4 py-1.5 text-[10px] text-[#8A6116] bg-[#FFF7E6] border-b border-[#F2E8C8]">
              {warning}
            </div>
          )}

          {!preview ? (
            <div className="px-4 py-6 text-center text-[11px] text-[#7A8AAC] flex-1">
              Choose toggles, then <span className="text-[#0D57FA] font-medium">Format section</span> to preview.
              <div className="mt-1 text-[10px]">
                Bold and headers render in the preview only — the note stays plain text.
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto scrollbar-hide flex-1">
              <div className="px-4 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Before
              </div>
              <div className="mx-4 mb-2 p-2 border border-border rounded bg-white text-[11px] whitespace-pre-wrap"
                style={{ color: "#0B1F52", maxHeight: 140, overflowY: "auto" }}
              >
                {preview.before || <span className="italic text-[#A3B0C8]">Empty.</span>}
              </div>
              <div className="px-4 pt-1 pb-1 text-[9px] font-semibold uppercase tracking-wider text-[#0D57FA]">
                After (preview)
              </div>
              <div className="mx-4 mb-3 p-2 border rounded bg-[#F8FBFF] text-[11px] leading-relaxed"
                style={{ borderColor: "#D8E7FF", color: "#0B1F52", maxHeight: 220, overflowY: "auto" }}
              >
                {renderPreview(preview.after, changedLines)}
              </div>
              <div className="px-4 pb-3 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => { setPreview(null); setWarning(null); }}
                  className="text-[10px] px-2.5 py-1 rounded border border-border bg-white text-[#46587E] hover:border-[#0D57FA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyPreview}
                  className="text-[10px] px-2.5 py-1 rounded font-medium transition-colors"
                  style={{ background: "#0D57FA", color: "white" }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(node, document.body);
}
