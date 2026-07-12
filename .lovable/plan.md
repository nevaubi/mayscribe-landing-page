Four scoped fixes to the demo dictation pipeline. No visual redesign.

## 1. Dose-range integrity + shared RxTerms client

**`src/components/demo/lookupClient.ts` (new)**
- Extract `RXTERMS_URL`, `CONDITIONS_URL`, in-memory `sessionStorage`-backed caches, and the fetch helpers from `QuickLookup.tsx`.
- Export `searchRxTerms(q, signal)`, `getStrengthsAndForms(rxcui|name, signal)` (using `ef=STRENGTHS_AND_FORMS`), `searchConditions(q, signal)`. Each takes an `AbortSignal`, dedupes in-flight promises by key, returns typed results.

**`src/components/demo/QuickLookup.tsx`**
- Delete local fetch/cache; import from `lookupClient`.
- No UI changes.

**`src/components/demo/lexicon.ts`**
- Keep `typicalDoseRange` on a curated ~80–100 entry allowlist (the demo patient's meds — Lisinopril, Metformin, Atorvastatin — plus the most common outpatient/inpatient meds: metoprolol, amlodipine, losartan, HCTZ, furosemide, aspirin, clopidogrel, apixaban, warfarin, insulin glargine, levothyroxine, omeprazole, pantoprazole, albuterol, prednisone, amoxicillin, azithromycin, ceftriaxone, ibuprofen, acetaminophen, gabapentin, sertraline, escitalopram, trazodone, hydrocodone-acetaminophen, oxycodone, morphine, tramadol, ondansetron, heparin, enoxaparin, montelukast, fluticasone, tamsulosin, finasteride, allopurinol, colchicine, and similar high-signal meds — final list picked from existing entries).
- All other entries keep `name`/`aliases`/`routes`/`freqs` but drop `typicalDoseRange`. Update the `MedEntry` type so `typicalDoseRange` is optional.

**`src/components/demo/verify.ts`** (dose-range logic around line 105)
- When a med+dose pair matches:
  - If curated `typicalDoseRange` exists → keep current deterministic behavior (unchanged).
  - Else → collect the span into a "pending async" list.
- After the deterministic pass returns holds, in the caller (`useVerify`/wherever `verifyTranscript` is invoked) fire an async pass:
  - For each pending span, call `getStrengthsAndForms(medName, controller.signal)` with a 400ms `AbortController` timeout.
  - Parse strengths (e.g. "10 mg", "20 mg", "40 mg") into numeric (value, unit) pairs.
  - Pass if `dose == strength` or `dose == k*strength` for integer `k ∈ [1..4]` on any listed strength (same unit).
  - Fail → new HOLD, `reason: "Available strengths: X, Y"` with the two nearest real strengths as candidates. Never clear a deterministic hold — merge is add-only.
  - Timeout / abort / empty data → fall back to the existing confidence rule.
- Confirm the existing `dictationAssist` server-fn call is already wrapped in a 2 s `AbortController`; if not, add it, and enforce the same add-only merge (Gemini may add holds, never clear).

## 2. AudioWorklet PCM transport

**`public/pcm-worklet.js` (new)**
- `AudioWorkletProcessor` that:
  - Reads the AudioContext sample rate from `sampleRate` (worklet global).
  - Downsamples mono to 16000 Hz via linear step (`ratio = sampleRate/16000`, index accumulator).
  - Converts Float32 → Int16 (`Math.max(-1,Math.min(1,x))*0x7FFF`).
  - Buffers ~100 ms (1600 samples) then `port.postMessage(int16.buffer, [int16.buffer])`.
- Registers as `pcm-downsampler-16k`.

**`src/components/demo/useDictation.ts`**
- Deepgram URL becomes two constants:
  - `DG_URL_PCM = "wss://…?model=nova-3-medical&…&encoding=linear16&sample_rate=16000&channels=1"`
  - `DG_URL_OPUS` = current URL.
- After `getUserMedia`, try worklet path:
  - Reuse the existing `AudioContext` (currently created only for the analyser); create it once, share with the analyser.
  - `await ctx.audioWorklet.addModule('/pcm-worklet.js')`.
  - `new AudioWorkletNode(ctx, 'pcm-downsampler-16k')`, connect mic source → worklet (and mic source → analyser as today).
  - On `port.onmessage` send the ArrayBuffer over the socket if OPEN and session matches.
  - Open socket with `DG_URL_PCM`.
- If worklet setup throws (older Safari, blocked, etc.), fall back to current `MediaRecorder` path and `DG_URL_OPUS` — same session/error handling.
- Cleanup: disconnect and null the worklet node alongside recorder cleanup.

## 3. Smooth interim text (RAF reveal)

**Shared behavior in `DictationStrip.tsx` and `ReviewTray.tsx`**
- Remove `interim` from React state paths that drive re-renders of the text region. Keep it as a prop passed in, but internally:
  - `targetRef` (latest interim string).
  - `renderedRef` (currently-drawn substring).
  - One `requestAnimationFrame` loop while visible:
    - If `target` starts with `rendered` → reveal 2–4 more chars per frame from `target`.
    - Else (backtracking / rewrite) → snap `rendered = target`.
    - On final commit (interim cleared or replaced by a final) → snap.
  - Write via `spanRef.current.textContent = rendered`.
- Container: fixed line-height, `overflow: hidden`, `direction: ltr` with `text-align: right` (or flex `justify-end`) so newest words stay visible in the strip; ReviewTray keeps its normal flow but the interim tail line uses the same right-anchored 1-line region.
- Append a blinking 1px caret span (`::after` or a sibling `<span>` with CSS `@keyframes blink`) directly after the interim tail.

## 4. Cleanup + F1 discoverability

- Delete `src/components/demo/HighlightedTextarea.tsx` (already unused after prior refactor).
- **`DictationStrip.tsx`**: add a small muted chip just before the stop button:
  - Base: `"F1 · Review"`, same 10–11px muted style as existing labels, no width change (fits in existing row; no reflow slot needed since it's static).
  - When `holdEntries.length > 0` (new prop `holdCount: number`) → append a blue count badge (small pill, `#EEF6FF` bg, `#0D57FA` text).
  - New prop `reviewOpen: boolean`. When a new hold appears (holdCount rises) AND `!reviewOpen`, trigger a subtle amber pulse (CSS keyframe on the chip for ~1.2s) driven by a `useEffect` watching holdCount deltas.
- **`EmrDashboard.tsx`**: pass `holdCount={holdEntries.length}` and `reviewOpen={showReview}` to `DictationStrip`.

## Files touched

- New: `public/pcm-worklet.js`, `src/components/demo/lookupClient.ts`
- Edited: `src/components/demo/lexicon.ts`, `src/components/demo/verify.ts`, `src/components/demo/useDictation.ts`, `src/components/demo/DictationStrip.tsx`, `src/components/demo/ReviewTray.tsx`, `src/components/demo/QuickLookup.tsx`, `src/components/demo/EmrDashboard.tsx`, possibly `src/lib/dictation-assist.functions.ts` caller if the 2 s abort isn't already there
- Deleted: `src/components/demo/HighlightedTextarea.tsx`

No changes to routes, styling tokens, EMR layout, or landing page.
