import { useEffect, useRef } from "react";

interface Props {
  target: string;
  className?: string;
  style?: React.CSSProperties;
  /** Prefix rendered before the interim text (e.g. leading space). */
  prefix?: string;
  /** Show a blinking caret after the tail. */
  showCaret?: boolean;
  /** Characters revealed per animation frame. */
  charsPerFrame?: number;
  /** Right-anchor the text so newest chars stay visible. */
  rightAnchor?: boolean;
}

/**
 * RAF-smoothed interim text renderer.
 *
 * Keeps the target string in a ref and reveals a few characters per frame
 * toward it via `textContent`, snapping instantly on finals (empty target)
 * and on backtracking rewrites. Never triggers React re-renders per frame.
 */
export function SmoothInterim({
  target,
  className,
  style,
  prefix = "",
  showCaret = true,
  charsPerFrame = 3,
  rightAnchor = true,
}: Props) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const targetRef = useRef<string>(target);
  const currentRef = useRef<string>("");
  const rafRef = useRef<number | null>(null);

  // Snap on empty (final flush) or when the new target is not an extension of
  // the current — indicates a rewrite from Deepgram; we don't want to type
  // through incorrect intermediate characters.
  useEffect(() => {
    targetRef.current = target;
    const cur = currentRef.current;
    if (!target) {
      currentRef.current = "";
      if (spanRef.current) spanRef.current.textContent = "";
      return;
    }
    if (!target.startsWith(cur)) {
      currentRef.current = target;
      if (spanRef.current) spanRef.current.textContent = prefix + target;
    }
  }, [target, prefix]);

  useEffect(() => {
    const tick = () => {
      const t = targetRef.current;
      let c = currentRef.current;
      if (c !== t) {
        if (!t.startsWith(c)) {
          c = t;
        } else if (c.length < t.length) {
          c = t.slice(0, Math.min(t.length, c.length + charsPerFrame));
        } else {
          c = t;
        }
        currentRef.current = c;
        if (spanRef.current) spanRef.current.textContent = prefix + c;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [charsPerFrame, prefix]);

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        whiteSpace: "nowrap",
        overflow: "hidden",
        direction: rightAnchor ? "rtl" : "ltr",
        maxWidth: "100%",
        ...style,
      }}
    >
      <span
        ref={spanRef}
        style={{ direction: "ltr", unicodeBidi: "plaintext" }}
      />
      {showCaret && (
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 1,
            height: "1em",
            background: "currentColor",
            marginLeft: 2,
            animation: "smooth-interim-blink 1s steps(2) infinite",
            direction: "ltr",
          }}
        />
      )}
      <style>{`@keyframes smooth-interim-blink { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }`}</style>
    </span>
  );
}
