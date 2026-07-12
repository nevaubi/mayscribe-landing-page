## Plan

### 1. Slim, smoother floating dictation strip
- Reduce width from 760px to ~520px (still `min()` with viewport).
- Tighten paddings, shrink waveform to ~10 bars, remove the redundant preview text box (interim text will now live in the Review popup instead).
- Keep only: status dot + label + elapsed, section chip, compact waveform, quiet countdown, close button.
- Smooth waveform: interpolate `audioLevel` with a small RAF-driven eased value so bars don't jitter; add subtle opacity/height easing.

### 2. Move the full transcript into the Review popup
- Redesign `ReviewTray` (rename conceptually to "Review Panel", same file) into a two-part popup:
  - **Top:** full committed + interim transcript rendered as rich text. Words/phrases flagged by `verify()` get inline highlights (amber for holds, blue dotted for meds) directly in this panel only.
  - **Bottom:** the existing per-hold action cards (candidates, Lookup, Dismiss).
- Highlights are rendered here from `spans` offsets — no overlay in the EMR textarea.
- Remove `HighlightedTextarea` mirror-overlay usage from `EmrDashboard`; the SOAP fields become plain textareas again. Keep `HighlightedTextarea` file but stop importing it (or swap to plain `<Textarea>`).

### 3. Smarter number/age vs dose classification
- Update `lexicon.ts` `detectAll` (and dose regex) so a numeric token is only classified as `dose` when:
  - it's followed by a real dose unit (`mg`, `mcg`, `g`, `mL`, `units`, `IU`, `%`, `mg/kg`, etc.), OR
  - it's within a short window after a known medication name.
- Add an `age/quantity` classifier that recognizes patterns like `<n> year[s] old`, `age <n>`, `<n> years`, `<n> days`, `<n> weeks`, `<n> months`, `x<n>`, `<n> times`, `<n> episodes`. These are excluded from med/dose verification entirely (never produce a "not a prescription" style flag).
- In `verify.ts`, guard: a `low_confidence` hold is only created for numeric spans that are actual doses (unit-bearing or med-adjacent). Standalone numbers get no hold.

### 4. Formatting options in the Review popup (non-destructive)
- Add a small "Formatting" strip at the top of the Review popup with clickable, toggleable chips that reformat the transcript view without changing the raw words:
  - **Punctuation polish** — sentence casing, terminal periods, comma spacing.
  - **Numbers & units** — `10mg` → `10 mg`, `bid` → `BID`, `q6h` normalized.
  - **Section casing** — first letter of each sentence uppercase.
  - **Original** — revert to raw dictated text.
- These operate on a display copy only. Committing to the SOAP field happens on Enter/confirm, and the SOAP textarea receives the currently displayed formatted string (still no word substitutions — only whitespace, punctuation, casing).
- Each chip toggles independently; "Original" clears all toggles.

### 5. Wiring / cleanup
- `EmrDashboard`: pass `interim` + full section text + spans into the Review popup; keep textareas plain.
- `useDictation`: no logic change beyond exposing the same interim string to the Review popup (already available).
- Ensure the Review popup only mounts when there is either an active dictation session or at least one hold — otherwise stays hidden.

### Technical notes

- Files touched: `src/components/demo/DictationStrip.tsx`, `src/components/demo/ReviewTray.tsx`, `src/components/demo/EmrDashboard.tsx`, `src/components/demo/lexicon.ts`, `src/components/demo/verify.ts`. New helper `src/components/demo/format-options.ts` for the reversible formatting toggles.
- No backend changes; Gemini assist call remains as-is.
- No changes to `useDictation` streaming logic or auto-quiet-stop.
