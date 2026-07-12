import { useMemo } from "react";
import type { Span } from "./verify";

interface HoldRange {
  start: number;
  end: number;
  span: Span;
}

interface Props {
  value: string;
  holds: HoldRange[]; // active holds (placeholders) in this section
  dismissed: HoldRange[]; // dismissed → amber underline
  flashRange: { start: number; end: number } | null;
  activeHoldId?: string | null;
}

// Renders a transparent-textarea overlay showing:
//   - placeholder ranges in muted color
//   - dismissed-hold ranges with amber dotted underline
//   - a 600ms light blue flash on the just-committed range
// Text metrics MUST match the textarea's font-family, size, line-height,
// and padding so character positions align.
export function TextOverlay({ value, holds, dismissed, flashRange, activeHoldId }: Props) {
  const pieces = useMemo(() => {
    // Combine all ranges into non-overlapping segments
    interface Marker {
      pos: number;
      kind: "start" | "end";
      style: "hold" | "dismissed" | "flash";
      spanId?: string;
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
    const positions = Array.from(new Set([0, value.length, ...markers.map((m) => m.pos)]))
      .filter((p) => p >= 0 && p <= value.length)
      .sort((a, b) => a - b);

    const activeStyles = new Set<string>();
    const activeSpanIds = new Set<string>();
    const out: { text: string; styles: Set<string>; spanId?: string }[] = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const p = positions[i];
      // apply markers at position p
      for (const m of markers) {
        if (m.pos !== p) continue;
        if (m.kind === "start") {
          activeStyles.add(m.style);
          if (m.spanId) activeSpanIds.add(m.spanId);
        } else {
          activeStyles.delete(m.style);
          if (m.spanId) activeSpanIds.delete(m.spanId);
        }
      }
      const text = value.slice(p, positions[i + 1]);
      if (!text) continue;
      out.push({
        text,
        styles: new Set(activeStyles),
        spanId: activeSpanIds.size > 0 ? Array.from(activeSpanIds)[0] : undefined,
      });
    }
    return out;
  }, [value, holds, dismissed, flashRange]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 p-4 whitespace-pre-wrap break-words"
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
        const isActive = p.spanId && p.spanId === activeHoldId;
        return (
          <span
            key={idx}
            style={{
              backgroundColor: isFlash
                ? "#EEF4FC"
                : isHold
                  ? isActive
                    ? "#FFF3CC"
                    : "#FFF7E6"
                  : "transparent",
              color: isHold ? "#7A8AAC" : "transparent",
              textDecoration: isDismissed ? "underline" : "none",
              textDecorationStyle: isDismissed ? "dotted" : undefined,
              textDecorationColor: isDismissed ? "#D97706" : undefined,
              borderRadius: isHold || isFlash ? 2 : 0,
              transition: "background-color 400ms ease",
            }}
          >
            {p.text}
          </span>
        );
      })}
    </div>
  );
}
