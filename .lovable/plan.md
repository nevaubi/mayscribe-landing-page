## Plan

### 1. Stop the "Quiet Ns" pill from resizing the dictation strip
In `src/components/demo/DictationStrip.tsx`, reserve fixed space for the quiet countdown instead of conditionally mounting the pill:
- Always render a fixed-width slot (e.g. `width: 68px`, right-aligned) between the waveform and the close button.
- Toggle only the pill's `opacity` (0 ↔ 1) and inner content based on `quietCountdown != null`.
- Same treatment for the error text slot so error state doesn't reflow either — cap it in a fixed-width container with `truncate`.
Result: card width stays constant across idle/listening/quiet/error states.

### 2. Make the Review popup draggable
In `src/components/demo/ReviewTray.tsx`:
- Replace the current `fixed right-6 top-24` positioning with a stateful `{ x, y }` position stored in `useState`, initialized to the current top-right anchor (computed from `window.innerWidth - 380 - 24`, `96`).
- Add a drag handle: the existing header row (the `Review` + section chip + count bar) gets `cursor-grab` / `active:cursor-grabbing` and `onPointerDown`.
- On `pointerdown` capture the pointer, record offset; on `pointermove` update `{ x, y }`; on `pointerup` release. Clamp to viewport bounds so the card can't be dragged fully offscreen (keep at least 40px visible on each side).
- Buttons inside the header (none currently, but future-proof) get `data-no-drag` and the handler bails if `e.target.closest('[data-no-drag]')`.
- Persist position in `useRef` only (no localStorage) — resets per session, matches the ephemeral nature of the panel.
- Keep everything else (formatting toggles, transcript, hold cards, portal, z-index) unchanged.

### Files touched
- `src/components/demo/DictationStrip.tsx` — fixed-width slots for quiet countdown + error.
- `src/components/demo/ReviewTray.tsx` — draggable header, position state, pointer handlers, viewport clamping.

No changes to dictation logic, verification, or EMR wiring.
