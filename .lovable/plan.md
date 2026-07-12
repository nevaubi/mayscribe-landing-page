# Finish the dictation refactor

The expanded ~250-med lexicon and the DictationStrip type fix are already in. Three items from the previous plan remain.

## 1. `src/components/demo/EmrDashboard.tsx` — detach dictation UI from the EMR

- Remove the toolbar mic button (`Mic` / `MicOff` trigger) and its `MicOff` import. F2 remains the only way to start/stop.
- Remove the in-editor visual coupling to dictation:
  - Drop the `ring-2 ring-inset ring-[#0D57FA]` "listening" ring on the active textarea.
  - Drop the floating "Section: subjective" caption block that overlays the SOAP editor.
  - Remove `<TextOverlay>` and its imports/props from the SOAP fields so no highlights (holds, dismissed, flash, med dotted underlines) render inside the textarea. Keep the plain textarea only.
- Move `<DictationStrip>` out of the SOAP card. Mount it once at the root of the dashboard so the portal inside DictationStrip renders it as a floating popup above everything. Keep the same props already wired.
- The Review Tray keeps its existing highlight semantics (it renders its own cards), so hold/dismiss state stays functional — just no in-editor tinting.

## 2. `src/components/demo/QuickLookup.tsx` — conditions fallback

- Add a small local `CONDITIONS` constant (≈40 common conditions with ICD-10 hints) or import from the existing `clinical-knowledge.ts` if it already exports one.
- When the `/conditions/v3/search` call rejects or returns non-2xx, fall back to a case-insensitive `includes` scan over that list, capped at 5, mirroring the existing meds fallback path.
- No UI changes — same result group rendering.

## 3. Sanity pass

- Confirm no dangling references to removed props/imports (`TextOverlay`, `MedMatch`, `medMatchesBySection`, `Mic`, `MicOff`, `isListening`).
- Leave `HighlightedTextarea.tsx` in place; it's still imported by the lexicon hover reference infrastructure if needed later, but no route currently uses it after this change. Not deleted to avoid surprise.

## Out of scope for this turn

- Deepgram tuning, waveform smoothing, and RAF interim batching — already landed in `useDictation.ts` and `DictationStrip.tsx` in the prior turn.
- Lexicon expansion — already committed.
