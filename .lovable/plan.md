## Format tab — LLM-only rebuild

**Delete**
- `src/components/demo/format-options.ts` in its entirety (deterministic pass, `ABBREVIATIONS`, `applyPunctuation`, `applyUnitsAndAbbrev`, `applySentenceCase`, `applyAbbrevPlus`, `applyParagraphs`, `deterministicClean`, `applyFormatToggles`, `applyDeterministicFormat`).
- `src/components/demo/formatIntegrity.ts` (integrity check gone).
- All imports/references to the above in `ReviewTray.tsx`.

**Keep as tiny helper**
- `toAppliedPlainText()` (strips `**bold**` and `#` markers when text is applied to the SOAP textarea). Move it inline into `ReviewTray.tsx`.

**New Format tab UI** in `ReviewTray.tsx`
- Remove all deterministic chips (Punctuation, Sentence case, Units & abbrev., Abbreviations+, Paragraphs) and the Structure chip.
- Show three toggles, all default-on:
  1. **Spelling** — ordinary English spelling + spacing/casing fixes.
  2. **Auto-format** — headers, hyphen bullets, `**bold**` on critical values, paragraph breaks at topic shifts.
  3. **Dose units** — normalize dosage-unit words (e.g. `milligrams`→`mg`, `micrograms`→`mcg`, `milliliters`→`mL`, `units`, `mEq`, `mmol`, `IU`, `%`, `mmHg`, `bpm`). Only dose-adjacent units; not routes/frequencies/labs.
- Single "Format" button runs the LLM pipeline once and renders the preview.

**Preview behavior**
- The LLM returns two things: `formatted` (spelling + auto-format applied, dose words untouched) and `doseChanges: Array<{ before: string; after: string; offset: number; length: number }>` giving each proposed dose-unit rewrite in `formatted` coordinates.
- The preview renders `formatted` with each `doseChange` shown as an inline chip: strikethrough `before` → pill `after`, with ✓/✕ buttons. Default state accepted (visual green tint). Clicking ✕ reverts that span to `before`; ✓ re-accepts.
- "Apply" writes `formatted` with the currently-accepted `after`s spliced in (and rejected ones left as `before`) into the SOAP textarea, after running `toAppliedPlainText`.
- No integrity check. LLM output is trusted.

**Server function** `src/lib/format-assist.functions.ts` (rewrite)
- Same Fireworks GLM-5.2 endpoint, 6s timeout + one retry.
- New JSON schema: `{ formatted: string, doseChanges: { before, after, offset, length }[] }`.
- New system prompt: fix spelling/spacing/casing; when Auto-format on, add UPPERCASE headers, hyphen bullets, `**bold**` on critical values, paragraph breaks; do NOT rewrite dose-unit words in `formatted` — instead emit them in `doseChanges` with exact offsets so the UI can request approval; never invent new drugs, numbers, doses, negations, or laterality terms.
- Input: `{ text, toggles: { spelling, autoFormat, doseUnits } }`.

## Parallel batch transcription cross-check (Together AI)

**Secret**: request `TOGETHER_API_KEY` via `add_secret`.

**Client** (`useDictation.ts`)
- Add a running PCM ring buffer: capture the same 16 kHz mono Int16 frames the worklet emits (already flowing to Deepgram) into an in-memory `Int16Array[]` list, capped at ~10 min.
- On `stop()`: concat buffer, encode WAV in the browser (small helper `pcmToWav.ts`), and POST it as multipart/form-data to a new server route `POST /api/batch-transcribe` alongside the current streamed transcript. Non-blocking — resolves after normal stop.
- Result surfaced via a new callback `onBatchTranscript({ text, diffs })`.

**Server route** `src/routes/api/batch-transcribe.ts`
- Accept multipart WAV + `streamedTranscript` field.
- Call Together SDK with model `firasshaher99_0edd/nvidia/parakeet-tdt-0.6b-v3-361f8f03`. The SDK accepts a `file` — pass the uploaded blob directly (no HuggingFace URL). Read `process.env.TOGETHER_API_KEY` inside the handler.
- Compute a lightweight word-level diff between the batch transcript and the streamed transcript (LCS-based; util in `src/components/demo/transcriptDiff.ts`).
- Return `{ text, diffs: Array<{ streamed: string, batch: string, contextBefore: string, contextAfter: string }> }`.

**UI**
- In the Review popup, add a small "Accuracy check" chip next to the Format tab that lights up when diffs > 0. Clicking opens an inline panel listing each discrepancy with a one-click "Use batch version" that replaces the streamed span in the note textarea.
- If Together fails (network/timeout/no key), silently no-op — never blocks the Format flow.

## Technical details

- No deterministic layer: Fireworks handles all whitespace/spelling/punctuation fixes and structural formatting.
- Dose-unit approval is scoped to unit tokens only (regex-anchored to a number-adjacent word). The LLM is instructed to leave everything else in place.
- PCM buffer memory: worst-case 10 min × 16 kHz × 2 bytes ≈ 19 MB — acceptable, cleared on new session.
- Together SDK is Node-compatible and works in Cloudflare Workers via `fetch`; we'll call the REST endpoint directly with `fetch` (Node SDK isn't required) to avoid Worker runtime issues.
- Batch transcribe latency doesn't affect Format tab; it runs post-stop and updates the Review panel when ready.

## Files touched

```text
src/components/demo/
  format-options.ts          DELETE
  formatIntegrity.ts         DELETE
  ReviewTray.tsx             rewrite Format tab, add dose-chip preview, add Accuracy chip
  useDictation.ts            add PCM ring buffer, batch POST on stop
  pcmToWav.ts                NEW (client helper)
  transcriptDiff.ts          NEW (LCS word diff)
src/lib/
  format-assist.functions.ts rewrite: new schema, new prompt, no integrity
src/routes/api/
  batch-transcribe.ts        NEW server route (Together AI)
```

## Side question answered

No parallel/cross-reference transcribe today — only Deepgram's single streaming pass with `is_final` chunks treated as truth. This plan adds one via Together AI Parakeet on stop.
