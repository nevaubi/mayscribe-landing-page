import { useMemo } from "react";
import type { Span } from "./verify";
import { MEDS } from "./lexicon";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface HoldRange {
  start: number;
  end: number;
  span: Span;
}

export interface MedMatch {
  start: number;
  end: number;
  medName: string;
}

interface Props {
  value: string;
  holds: HoldRange[]; // active holds (placeholders) in this section
  dismissed: HoldRange[]; // dismissed → amber underline
  flashRange: { start: number; end: number } | null;
  activeHoldId?: string | null;
  medMatches?: MedMatch[];
  onMedClick?: (medName: string, start: number) => void;
}

// Renders a transparent-textarea overlay showing:
//   - placeholder ranges in muted color
//   - dismissed-hold ranges with amber dotted underline
//   - a 600ms light blue flash on the just-committed range
//   - med lexicon matches with a subtle dotted underline + HoverCard reference
// Text metrics MUST match the textarea's font-family, size, line-height,
// and padding so character positions align.
export function TextOverlay({
  value,
  holds,
  dismissed,
  flashRange,
  activeHoldId,
  medMatches = [],
  onMedClick,
}: Props) {
  const pieces = useMemo(() => {
    type StyleKind = "hold" | "dismissed" | "flash" | "medref";
    interface Marker {
      pos: number;
      kind: "start" | "end";
      style: StyleKind;
      spanId?: string;
      medName?: string;
    }
    const markers: Marker[] = [];
    for (const h of holds) {
      markers.push({ pos: h.start, kind: "start", style: "hold", spanId: h.span.id });
      markers.push({ pos: h.end, kind: "end", style: "hold", spanId: h.span.id });
    }
    for (const d of dismissed) {
      markers.push({ pos: d.start, kind: "start", style: "dismissed", spanId: d.span.id });
      markers.push({ pos: d.end, kind: "end", style: "dismissed", spanId: d.span.id });
    }
    if (flashRange) {
      markers.push({ pos: flashRange.start, kind: "start", style: "flash" });
      markers.push({ pos: flashRange.end, kind: "end", style: "flash" });
    }
    for (const m of medMatches) {
      markers.push({
        pos: m.start,
        kind: "start",
        style: "medref",
        medName: m.medName,
      });
      markers.push({
        pos: m.end,
        kind: "end",
        style: "medref",
        medName: m.medName,
      });
    }
    const positions = Array.from(
      new Set([0, value.length, ...markers.map((m) => m.pos)]),
    )
      .filter((p) => p >= 0 && p <= value.length)
      .sort((a, b) => a - b);

    const activeStyles = new Set<StyleKind>();
    const activeSpanIds = new Set<string>();
    const activeMedNames = new Set<string>();
    const out: {
      text: string;
      styles: Set<StyleKind>;
      spanId?: string;
      medName?: string;
      start: number;
    }[] = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const p = positions[i];
      for (const m of markers) {
        if (m.pos !== p) continue;
        if (m.kind === "start") {
          activeStyles.add(m.style);
          if (m.spanId) activeSpanIds.add(m.spanId);
          if (m.medName) activeMedNames.add(m.medName);
        } else {
          activeStyles.delete(m.style);
          if (m.spanId) activeSpanIds.delete(m.spanId);
          if (m.medName) activeMedNames.delete(m.medName);
        }
      }
      const text = value.slice(p, positions[i + 1]);
      if (!text) continue;
      out.push({
        text,
        styles: new Set(activeStyles),
        spanId: activeSpanIds.size > 0 ? Array.from(activeSpanIds)[0] : undefined,
        medName:
          activeMedNames.size > 0 ? Array.from(activeMedNames)[0] : undefined,
        start: p,
      });
    }
    return out;
  }, [value, holds, dismissed, flashRange, medMatches]);

  return (
    <div
      aria-hidden
      className="absolute inset-0 p-4 whitespace-pre-wrap break-words pointer-events-none"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "11.5px",
        lineHeight: "1.7",
        color: "transparent",
        overflow: "hidden",
      }}
    >
      {pieces.map((p, idx) => {
        const isHold = p.styles.has("hold");
        const isDismissed = p.styles.has("dismissed");
        const isFlash = p.styles.has("flash");
        const isMedRef = p.styles.has("medref") && !isHold && !isDismissed;
        const isActive = p.spanId && p.spanId === activeHoldId;

        const baseStyle: React.CSSProperties = {
          backgroundColor: isFlash
            ? "#EEF4FC"
            : isHold
              ? isActive
                ? "#FFF3CC"
                : "#FFF7E6"
              : "transparent",
          color: isHold ? "#7A8AAC" : "transparent",
          textDecoration: isDismissed
            ? "underline"
            : isMedRef
              ? "underline"
              : "none",
          textDecorationStyle: isDismissed || isMedRef ? "dotted" : undefined,
          textDecorationColor: isDismissed
            ? "#D97706"
            : isMedRef
              ? "#94A3B8"
              : undefined,
          textUnderlineOffset: isMedRef ? 3 : undefined,
          borderRadius: isHold || isFlash ? 2 : 0,
          transition: "background-color 400ms ease",
        };

        if (isMedRef && p.medName) {
          const med = MEDS.find((m) => m.name === p.medName);
          const medName = p.medName;
          const startPos = p.start;
          return (
            <HoverCard key={idx} openDelay={200} closeDelay={80}>
              <HoverCardTrigger asChild>
                <span
                  style={{ ...baseStyle, pointerEvents: "auto", cursor: "help" }}
                  onClick={() => onMedClick?.(medName, startPos)}
                >
                  {p.text}
                </span>
              </HoverCardTrigger>
              {med && (
                <HoverCardContent
                  side="top"
                  align="start"
                  className="w-60 p-3"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <div className="text-[12px] font-semibold text-foreground mb-1.5">
                    {med.name}
                  </div>
                  <div className="space-y-0.5 text-[11px] text-foreground/80">
                    <div>
                      <span className="text-muted-foreground">Dose:</span>{" "}
                      {med.typicalDoseRange.min}–{med.typicalDoseRange.max}{" "}
                      {med.typicalDoseRange.unit}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Routes:</span>{" "}
                      {med.routes.join(", ")}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Freq:</span>{" "}
                      {med.freqs.join(", ")}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border text-[9px] uppercase tracking-widest text-muted-foreground/70">
                    Reference range, demo data
                  </div>
                </HoverCardContent>
              )}
            </HoverCard>
          );
        }

        return (
          <span key={idx} style={baseStyle}>
            {p.text}
          </span>
        );
      })}
    </div>
  );
}
