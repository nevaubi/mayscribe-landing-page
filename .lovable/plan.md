## Goal

Stop random dictated words from being flagged as misspelled medications. Replace the current boolean fuzzy match in `verify.ts` with an evidence-scored matcher that requires exact hit OR (phonetic + edit-distance similarity + clinical context evidence). No UI changes — the Review Panel simply holds fewer spans.

## New files

### `src/components/demo/commonWords.ts`
Exports `COMMON_WORDS: Set<string>` (~3,000 lowercase common English words). Purpose: short-circuit fuzzy matching on ordinary words like "coring", "cozy", "start", "as", "the", "precaution", "morning", "patient".

### `src/components/demo/metaphone.ts`
Compact Double Metaphone. Exports `metaphonePrimary(word: string): string`. Primary code only (no secondary); handles the anglicized cases needed for drug names (silent K, GN, PH→F, X→KS, TH, vowel drop, doubles). Deterministic, ~120 lines.

### `src/components/demo/medMatcher.ts`
Exports:
```ts
type MedMatch = { med: MedEntry; matchType: "exact"|"fuzzy"; score: number };
export function matchMedication(
  token: string,
  contextWindow: string,   // 40-char window of raw text around token
  wordConfidence: number,
): MedMatch | null;
```

Algorithm:
1. **Exact pass** (case-insensitive) against every `MedEntry.name` + every alias → return `{ matchType: "exact", score: Infinity }`. No context requirement.
2. **Gates for fuzzy**:
   - `wordConfidence < 0.90`
   - token not in `COMMON_WORDS`
   - token not recognized as condition / abbreviation / unit / lab / route / frequency (import from `clinical-knowledge.ts` + `lexicon.ts` route/freq lists)
   - token length ≥ 4 (tokens <5 chars: exact only per rules)
3. **Candidate filter** for each lexicon name/alias:
   - same first letter (case-insensitive)
   - `|len(token) − len(candidate)| ≤ 2`
   - `metaphonePrimary(token) === metaphonePrimary(candidate)`
   - length-scaled edit distance (Levenshtein):
     - 5–7 chars → max 1 edit
     - ≥8 chars → max 2 edits
4. **Context score** over the 40-char window (lowercased):
   - `+3` regex `\d+(?:\.\d+)?\s*(mg|mcg|g|ml|units?|iu|meq|mmol|%)` (dose+unit)
   - `+2` prescribing verb: start, increase, decrease, continue, hold, discontinue, switch, titrate, taper, resume, initiate, stop, adjust
   - `+1` any route token from `MedEntry.routes` universe (PO, IV, IM, SC, SL, PR, topical, inhaled, nebulized)
   - `+1` any frequency token (daily, BID, TID, QID, QHS, PRN, q4h, q6h, q8h, q12h, once, twice)
5. **Acceptance**: fuzzy candidate accepted only if `contextScore >= 3`. Best remaining candidate (lowest edit distance, ties broken by alias-vs-name preferring name) wins.
6. **Dev logging**: rejected fuzzy candidates logged via `if (import.meta.env.DEV) console.debug(...)` with `{token, candidate, editDistance, contextScore, reason}`.

### Self-test block
Dev-only IIFE guarded by `import.meta.env.DEV`, runs once at module load:
```ts
// 1. "coring" (0.95 conf) in "coring the sample"    → null
// 2. "asa"    (0.95)      in "as a precaution"      → null (exact ASA aliases removed from confusing contexts; token "asa" alone not present so this is naturally null)
// 3. "coreg"  (0.98)      in "start coreg 12.5 mg BID" → exact Carvedilol
// 4. "korvedilol" (0.55)  in "start korvedilol twelve point five milligrams" → fuzzy Carvedilol
// 5. "cozy"   (0.9)       in "the patient is cozy"  → null
// 6. "lisinopril" (0.99)  anywhere                  → exact
// 7. "metfromin" (0.6)    in "continue metfromin 500 mg BID" → fuzzy Metformin
// 8. "start"  (0.99)      in "start lisinopril"     → null (common word)
// 9. "morning" (0.9)      in "in the morning"       → null
// 10."atorvastatin" (0.4) in "she takes atorvastatin nightly" → exact (confidence irrelevant for exact)
```
Assertions logged via `console.assert`; no runtime impact in prod.

## Edited file

### `src/components/demo/verify.ts`
- Replace current med detection (currently comes from `detectAll` in lexicon which does substring matching) with a token-walk:
  1. Tokenize `formattedText` preserving offsets (word regex `/[A-Za-z][A-Za-z-]*/g`).
  2. For each token, compute 40-char context window (`text.slice(max(0,start-20), min(len, end+20))`), grab word confidence via existing `minConfidenceIn` helper against `words` array.
  3. Call `matchMedication(token, ctx, conf)`.
  4. If it returns a match, record `{med, matchType, start, end, contextScore}`.
- Dose pairing / LASA / range-check logic unchanged, but only applied to `exact | fuzzy | rxterms` matches.
- **RxTerms fallback (context score ≥ 5, no lexicon match)**: also computed during token walk. When context score ≥ 5 and both exact and fuzzy returned null AND token not in commonWords / clinical-knowledge, push into a `pendingRxTermsMedChecks` array returned by `verify()`. The caller (`EmrDashboard.tsx`) runs these through `searchRxTerms(token, signal)` with a 400ms AbortController; if a returned name starts with the token or has edit distance ≤ 2, treat as med with `matchType: "rxterms"` and run the existing async STRENGTHS_AND_FORMS check via `getStrengthsAndForms`. If RxTerms is empty, drop — no hold.
- **Hold policy**: gate the current med/dose/LASA hold branches on `matchType ∈ {exact, fuzzy, rxterms}`. Everything else can't produce a med hold.
- Wrap any residual `console.log` / `console.warn` used for debug inside `if (import.meta.env.DEV)`.

### `src/components/demo/EmrDashboard.tsx`
- Extend the existing async verification pass (already runs `pendingRangeChecks`) to also process the new `pendingRxTermsMedChecks`. Same add-only merge rule: async pass can add holds, never clear deterministic ones. 400ms AbortController shared with existing budget.

## Files NOT touched

- `lexicon.ts` (data unchanged)
- `clinical-knowledge.ts` (read-only import of its exported sets)
- `lookupClient.ts` (already exposes the RxTerms client)
- `useDictation.ts`, `DictationStrip.tsx`, `ReviewTray.tsx`, `QuickLookup.tsx`, styles, routes

## Expected behavior after change

- "coring the sample" → no hold (common-ish word + no context evidence + fails phonetic to Coreg's `KRK`).
- "as a precaution" → no hold ("as" and "a" are common words; "precaution" isn't an alias).
- "the patient is cozy" → no hold ("cozy" is common + no dose/verb context; Cozaar primary metaphone differs).
- "start coreg 12.5 mg BID" → exact hit on alias "coreg" → Carvedilol, range check runs.
- "start korvedilol twelve point five milligrams" (low conf) → fuzzy hit: `KRVTL` vs `KRVTL` primary metaphone tie, edit distance 2, context score 5 (verb+dose+unit) → Carvedilol.
- Truly novel meds not in lexicon (e.g. new brand names) still catchable via RxTerms fallback when clearly prescribed.
