# Quick Lookup Panel — Demo EMR

## 1. New component: `src/components/demo/QuickLookup.tsx`

Right-rail panel matching existing section styling (10px uppercase tracking-widest header, same border/padding as Vitals). Exposes an imperative handle so parent can pre-fill + focus:

```ts
export interface QuickLookupHandle {
  openWith: (query: string) => void;
}
```

**Structure**
- Header: `CLINICAL LOOKUP` (10px uppercase, tracking-widest, #0D57FA).
- Input: compact, 12px, placeholder "Search meds or conditions…", with a small clear (×) affordance.
- Results dropdown (inline, not floating) with two groups: **Medications** and **Conditions**, max 5 each, keyboard navigable (↑ ↓ Enter Esc; roving `activeIndex` across the flat list of visible items).
- Skeleton: 3 shimmer rows per active group while loading (reuse existing tailwind `animate-pulse`, tuned tones from tokens).
- Empty state: quiet "No matches" (11px, muted-foreground) — only after debounce settles.
- Selected med expands inline to show strength chips; chip click copies `"<name> <strength>"` and swaps chip label to `Copied` for 1500ms (no toast).

**Data fetching**
- Debounce 200ms via a small local hook (setTimeout + cleanup); ignore queries shorter than 2 chars.
- `AbortController` per keystroke, aborted on next input or unmount.
- Session cache: `Map<string, { meds, conditions }>` held in a `useRef` so it persists for the tab lifetime.
- Endpoints:
  - `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=<q>&ef=STRENGTHS_AND_FORMS&maxList=5`
    Response shape: `[total, codes, extra, displayStrings]`; strengths at `extra.STRENGTHS_AND_FORMS[i]` (pipe-separated string → split on `|`, trim).
  - `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=<q>&maxList=5`
    Response: `[total, codes, extra, displayStrings]`; use `displayStrings[i][0]`.
- Both fetched in parallel with `Promise.allSettled`. On rejection or non-2xx for the meds call, fall back silently to fuzzy scan of `MEDS` from `lexicon.ts` (case-insensitive contains + Levenshtein ≤ 2 on name/aliases, cap 5); strengths list built from `typicalDoseRange` (e.g. `min mg`, `max mg`).
- No spinner other than the skeleton; skeleton is unmounted the instant a response (or fallback) resolves.

## 2. Wire into `EmrDashboard.tsx`

- Add `const quickLookupRef = useRef<QuickLookupHandle>(null)` at the top of the component.
- In the right rail JSX, insert `<QuickLookup ref={quickLookupRef} />` directly above the existing Vitals block.
- Pass `quickLookupRef` down to `ReviewTray` via a new prop `onLookup?: (query: string) => void` implemented as `(q) => quickLookupRef.current?.openWith(q)`; also scrolls the panel into view.

## 3. Review Tray cross-links — `src/components/demo/ReviewTray.tsx`

- Accept optional `onLookup?: (query: string) => void` prop.
- For entries where `span.type === "med"` (see `lexicon.ts` `DetectedType`), render a small `Lookup` link (11px, #0D57FA, hover underline) inside the card action row next to `Dismiss`. Only shown when `onLookup` is provided.
- On click: `onLookup(h.rawText)` — pre-fills and focuses the panel input.

## 4. Lexicon hover card in mirror overlay

Extend the existing `TextOverlay` (`HighlightedTextarea.tsx`) — no second overlay layer:

- New optional prop `medMatches?: { start: number; end: number; medName: string }[]` computed once per section via `lexicon.detectAll(text)` filtered to `type === "med"`, memoised in `EmrDashboard`.
- Merge into the existing marker pipeline as a new style `"medref"` — rendered as a subtle dotted underline (`text-decoration: underline; text-decoration-style: dotted; text-decoration-color: #94A3B8; text-underline-offset: 3px`), only when the char is NOT already inside a hold/dismissed/flash range (holds win visually).
- Because the overlay is `pointer-events-none`, hover has to come from a sibling absolutely-positioned invisible layer that mirrors just the med spans as `pointer-events: auto` transparent boxes over the same character positions (position derived from a hidden mirror `<div>` measuring char rects). To keep this simple and reliable, render one small `HoverCard` trigger per med span as a `<span>` positioned via a mirror-div coordinate lookup — same measurement approach already used by `TextOverlay` (identical font metrics), just with `pointer-events: auto`.
- HoverCard content (shadcn `HoverCard`): title `{med.name}`, three lines from `MEDS`:
  - `Dose: {min}–{max} {unit}`
  - `Routes: {routes.join(", ")}`
  - `Freq: {freqs.join(", ")}`
  - Footer 10px muted: `Reference range, demo data`.

## 5. Session cache & abort details

- `resultsCacheRef = useRef(new Map<string, LookupResult>())` keyed by lowercased trimmed query.
- Effect on debounced query: if cached, return synchronously; else start fetch. Abort old controller in cleanup.

## Files touched

- `src/components/demo/QuickLookup.tsx` — new.
- `src/components/demo/EmrDashboard.tsx` — mount panel, wire ref, memoise med matches, pass `medMatches` + `onLookup`.
- `src/components/demo/ReviewTray.tsx` — add optional `onLookup` and `Lookup` link for med spans.
- `src/components/demo/HighlightedTextarea.tsx` — add `medMatches` prop, dotted-underline style, and mirror-measured hover triggers wrapping shadcn `HoverCard`.

No new deps (shadcn `HoverCard` is already available via components.json). No backend changes. No routing changes.
