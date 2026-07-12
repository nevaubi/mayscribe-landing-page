# Dictation Formatting + Verification Layer

Two-part change scoped to the demo EMR dictation pipeline. Landing page, demo gate, and token route logic are untouched except one origin-allowlist hardening in `src/routes/api/deepgram-token.ts`.

## Part A — Formatting & Clarity

### A1. `src/components/demo/useDictation.ts`
- Extend `UseDictationOptions` with `onUtteranceEnd?: () => void`.
- Handle `msg.type === "UtteranceEnd"` in the socket `onmessage` branch and invoke `onUtteranceEnd` (session-guarded).
- Change `onFinal` signature to `onFinal(text: string, words: DGWord[], meta: { speechFinal: boolean })`. Parse `speech_final` off the Results message and forward it.
- No behavioral change to start/stop/reconnect logic.

### A2. `src/routes/api/deepgram-token.ts` — allowlist hardening
- Replace the current `endsWith(suf)` check with:
  - entries with a leading `.` (e.g. `.lovable.app`) → `host.endsWith(suf)` OR `host === suf.slice(1)`.
  - bare entries (e.g. `localhost`, `mayscribe.com`) → `host === suf` only.
- Prevents `evilmayscribe.com` from matching `mayscribe.com`.

### A3. `src/components/demo/EmrDashboard.tsx` — formatter rewrite
Replace `prepareDictationInsert` with a new `formatDictationInsert(rawText, textBeforeCaret, { closeSentence })` that:

1. **Newline preservation** — collapse only `[ \t]+` to a single space; never touch `\n`. Deepgram dictation mode emits `\n` for "new line" and "\n\n" for "new paragraph"; keep as-is.
2. **Sentence casing** — uppercase first alphabetic char of the insert when `textBeforeCaret` is empty, ends with `\n`, or matches `/[.!?]\s*$/`. Otherwise leave case as-is.
3. **Spacing normalization** — regex pass: strip spaces before `.,;:!?`, ensure exactly one space after them when the next non-space char is a word char, single-space joining elsewhere. Preserve the existing open-bracket / leading-space logic against caret context.
4. **Medical token normalization** — word-boundary replacements:
   - `q\.?h\.?s\.?` → `QHS`; `b\.?i\.?d\.?` → `BID`; `t\.?i\.?d\.?` → `TID`; `prn` → `PRN`; `po` → `PO`; `iv` → `IV`.
   - Dose+unit collapse: `(\d+(?:\.\d+)?)\s*(milligrams?|mg|micrograms?|mcg|grams?|g|milliliters?|mL|units?)` → `<num> <canonical-unit>` where canonical is `mg | mcg | g | mL | units`.
5. **Sentence closing** — when `closeSentence` is true (utterance end OR `speechFinal`), and the committed section text currently ends with `[A-Za-z0-9]`, append `.` before the next insert. Implemented in the commit handler, not the formatter, since it mutates prior committed text.

### A4. `src/components/demo/DictationStrip.tsx` — interim tail
- Show last 90 chars of `interim`; if truncated, prefix `…`. Right-anchored ellipsis becomes left-anchored ellipsis so newest words remain visible.
- Keep existing pill/waveform/timer.

### A5. Active-target caption in `EmrDashboard.tsx`
- While `status === "listening"`, render a right-aligned 10px `#7A8AAC` caption above the active textarea: `Dictating into <SECTION LABEL>` (e.g. "S — Subjective"). Hidden otherwise.

## Part B — Verification Layer

Architecture: deterministic pass is authoritative; Gemini assists with formatting + candidate ranking within already-detected spans; the LLM cannot invent clinical values. All finals route through `verify()` before commit.

### B1. `src/components/demo/lexicon.ts` (new, static)
- `MEDS`: ~60 entries `{ name, aliases: string[], typicalDoseRange: { min, max, unit }, routes: string[], freqs: string[] }`. Must include demo patient meds (furosemide 20–160 mg, carvedilol 3.125–50 mg, lisinopril 2.5–40 mg, spironolactone 12.5–100 mg, metformin 500–2000 mg, atorvastatin 10–80 mg, aspirin 81–325 mg, insulin glargine 10–100 units).
- `LASA`: ≥15 pairs (hydroxyzine/hydralazine, clonidine/Klonopin, metoprolol/misoprostol, Celebrex/Celexa, tramadol/trazodone, prednisone/prednisolone, Zyrtec/Zantac, Lamictal/Lamisil, Adderall/Inderal, glipizide/glyburide, vinblastine/vincristine, hydrocodone/oxycodone, cycloserine/cyclosporine, chlorpromazine/chlorpropamide, epinephrine/ephedrine).
- `UNITS`: canonical set + confusion pairs (mg↔mcg↔g, units↔mL).
- Detectors exported as functions returning `{ start, end, type, text, meta }[]`:
  - med name (alias table + Levenshtein ≤2 fuzzy)
  - dose+unit `(\d+(?:\.\d+)?)\s*(mg|mcg|g|mL|units)`
  - bare numeric
  - laterality `\b(left|right|bilateral|unilateral)\b`
  - negation `\b(no|denies|without|negative for|absent)\b`
  - frequency (BID/TID/QID/QHS/PRN/daily/etc.)
  - route (PO/IV/IM/SC/SL/PR/topical)

### B2. `src/components/demo/verify.ts` (new)
Exports `verify(formattedText, words, ctx): { spans: Span[]; committedText: string; heldSpans: Span[] }` synchronous, plus `verifyAssist(formattedText, deterministicSpans, ctx): Promise<Span[]>` async.

Span type: `{ text, start, end, type, status: "commit" | "hold", candidates: string[], reason?: string, minConfidence: number }`.

**Deterministic pass (sync):**
1. Run all detectors → protected spans with char offsets into `formattedText`.
2. For each span, compute `minConfidence` = min over words whose `[start,end]` char range intersects the span. If no word-timing intersection, fall back to 1.0.
3. HOLD conditions:
   - Med resolved AND adjacent dose+unit outside `typicalDoseRange` → reason `"Dose above/below typical range for <med>"`, candidates = valid dose suggestions bounded to range.
   - Med matches LASA pair → candidates = both pair members, reason `"Sound-alike pair"`.
   - Unit ambiguity: numeric within span with conflicting/missing unit → candidates = plausible units.
   - `minConfidence < 0.86` on any protected span → reason `"Low confidence"`, candidates = [span.text, "(dismiss)"].
4. Everything else → COMMIT.

**Gemini assist (async, best-effort):**
- Model: `google/gemini-3.1-flash-lite` via Lovable AI Gateway (server function `src/lib/dictation-assist.functions.ts` — LOVABLE_API_KEY server-only). Temperature 1, `response_format: { type: "json_object" }`.
- System prompt: as specified in the request.
- User payload: `{ transcript, spans: deterministicSpans, activeMeds: [furosemide, carvedilol, lisinopril, spironolactone, metformin, atorvastatin, aspirin, insulin glargine] }`.
- Schema (no `.min/.max` — validated in code): `{ formattedText, spans: [{ text, start, end, type, needsReview, candidates, reason }] }`.
- 2 s hard timeout via `AbortController`. On timeout, non-2xx, or JSON parse failure → return deterministic result unchanged.
- Merge rule: OR the `hold` flag; deterministic candidates first, appended with any new Gemini candidates de-duped; Gemini may add holds within its own window; **Gemini can never clear a deterministic hold**.

### B3. `EmrDashboard.tsx` — commit path + Review Tray + mirror overlay
- **onFinal handler**: format via A3 formatter → `verify()` sync → immediately insert clean text for `commit` spans and underscore placeholders (`_`.repeat(span.text.length)) for `hold` spans; record `anchors: { id, sectionKey, start, end, span }[]`. Fire `verifyAssist()` in background; on resolve within 2 s, for any span it converts to hold, splice the already-inserted text back to a placeholder and open a tray card (adjust later anchors).
- **onUtteranceEnd / speechFinal**: apply Part A sentence-closing rule to committed section text before the next insert's casing.
- **Mirror overlay**: new component `HighlightedTextarea` wrapping each SOAP textarea. Absolutely-positioned `<div>` behind the textarea with matched font metrics, `white-space: pre-wrap`, `overflow: hidden`, transparent textarea bg. Renders:
  - (a) 600 ms `#EEF4FC` flash on newly committed range — replaces current full-textarea flash.
  - (b) amber dotted underline on dismissed-hold ranges.
  - (c) placeholder ranges in `#7A8AAC` muted color.
  - Overlay text mirrors textarea value; recomputes on change/scroll.
- **Review Tray**: fixed dock above editor footer, `translateY` slide-in when `anchors.some(a => a.span.status === "hold")`. One card per open hold: spoken snippet, reason, 2–3 candidate chips. Active card = 2 px `#0D57FA` left border, oldest-first ordering.
  - Keys (global while tray open): `1`/`2`/`3` select candidate, `Enter` splice into anchor + advance to next hold + adjust later anchors' offsets, `Esc` dismiss + insert raw transcript with amber underline.
- **Sign & Submit**: disabled while any hold open, tooltip `"Resolve N held items to sign"`. Save Draft always enabled. On last hold clearing → brief `#14A35C` check pulse then re-enable.
- **Footer status**: live `Verified: <checked> spans checked, <held> held`.

### B4. Latency
- Deterministic pass + placeholder insertion happen inside the same tick as `onFinal` — no added awaits before the textarea state update.
- Gemini upgrade is fire-and-forget; may downgrade a committed span to a hold up to 2 s later.

## Files touched

| File | Change |
| --- | --- |
| `src/routes/api/deepgram-token.ts` | Tighter allowlist matcher |
| `src/components/demo/useDictation.ts` | UtteranceEnd, speechFinal meta, words forwarded |
| `src/components/demo/DictationStrip.tsx` | Interim tail (last 90 chars w/ leading ellipsis) |
| `src/components/demo/EmrDashboard.tsx` | New formatter, verify integration, tray, overlay, caption, sentence-close, sign-gating |
| `src/components/demo/HighlightedTextarea.tsx` (new) | Mirror overlay for flash / underline / placeholders |
| `src/components/demo/ReviewTray.tsx` (new) | Hold cards + keybindings |
| `src/components/demo/lexicon.ts` (new) | MEDS/LASA/UNITS + detectors |
| `src/components/demo/verify.ts` (new) | Deterministic pass + Gemini merge |
| `src/lib/dictation-assist.functions.ts` (new) | `createServerFn` calling Gemini via Lovable AI Gateway with 2 s abort |

## Verification
- Playwright: enter demo, dictate a sample with a LASA trigger ("hydroxyzine 25 mg PO BID") and a low-confidence span; assert placeholder appears, tray opens, `1` + Enter splices selected candidate, Sign & Submit re-enables when tray empties.
- Manual: confirm `\n` from "new paragraph" produces a blank line; confirm `"12.5 milligrams"` normalizes to `"12.5 mg"`.

Confirm to proceed and I'll implement.