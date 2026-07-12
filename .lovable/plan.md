# Format Tab Expansion — Plan

Goal: expand the Review popup's Format tab from 3 toggles to 5, add an LLM-backed formatter guarded by a protected-token integrity check, and add a before/after preview with Apply/Undo. The underlying SOAP textarea stays plain text — bold/headers/bullets only render in the preview.

## 1. `src/components/demo/format-options.ts` (deterministic layer)

Keep the three current toggles (Punctuation, Units & Abbrev, Sentence Case). Add:

- **`abbrevPlus`** ("Abbreviations+"): extend the existing `ABBREVIATIONS` map to ~250 entries — labs (Na, K, Cl, HCO3, BUN, Cr, WBC, Hgb, Hct, Plt, INR, PTT, AST, ALT, ALP, TSH, HbA1c, LDL, HDL, TG, CRP, ESR, BNP, Trop, etc.), vitals (BP, HR, RR, SpO2, Temp, BMI), routes (PO, IV, IM, SC, SL, PR, IN, TOP, OS/OD/OU), frequencies (QD, BID, TID, QID, QHS, PRN, Q4H, Q6H, Q8H, Q12H, QAC, QPC), and clinical shorthand (SOB, CP, N/V, HA, LOC, ROS, PMH, PSH, FHx, SHx, HPI, A/P, s/p, w/, w/o, c/o, r/o, y/o, pt, hx). Applied case-insensitive **word-boundary only** to prevent mid-word rewrites.
- **`paragraphs`** ("Paragraphs"): if sentence count > 3, split into paragraphs (blank line separator) at topic-shift cue words appearing at sentence start: `Then`, `Plan`, `Assessment`, `On exam`, `Labs`, `Imaging`. Conservative — only break when the cue starts a sentence.

Export `applyDeterministicFormat(text, toggles)` returning plain text.

## 2. `src/lib/format-assist.functions.ts` (LLM layer)

New `createServerFn({ method: "POST" })` mirroring `dictation-assist.functions.ts`:
- Input (Zod): `{ text: string, toggles: { spelling: boolean; structure: boolean } }`
- Provider: `createLovableAiGatewayProvider`, model `google/gemini-3.1-flash-lite`, `temperature: 0`, `response_format: { type: "json_object" }`, 3s `AbortSignal.timeout(3000)`.
- System prompt (verbatim from spec): "You reformat clinical note text. Fix spelling of ordinary English words. You may reorganize into paragraphs, hyphen bullet lists when the text enumerates items, and UPPERCASE header lines for clear subsections, and you may wrap genuinely critical values in **double asterisks**. You must preserve every number, unit, medication name, dose, negation word, and laterality term exactly as given. Never add, remove, or reword clinical content. Return JSON { formatted: string }."
- User content composed from toggles: only ask for spelling fixes if `spelling`; allow restructuring if `structure`.
- Returns `{ formatted: string | null }`; null on timeout/error (caller falls back).

## 3. Integrity check — `src/components/demo/formatIntegrity.ts`

`extractProtectedTokens(text)` builds a sorted multiset of:
- Numbers with adjacent units (regex: `\d+(?:\.\d+)?\s*(mg|mcg|g|kg|mL|L|units?|%|mmHg|bpm|mEq|IU|hours?|hrs?|min|days?|weeks?|months?|years?)` and bare numbers).
- Medication names — reuse `lexicon.ts` exact-name/alias pass and `medMatcher` exact hits.
- Negations: `no`, `not`, `without`, `denies`, `denied`, `negative`, `absent`, `none`, `never`.
- Laterality: `left`, `right`, `bilateral`, `bilaterally`, `unilateral`.

`verifyIntegrity(input, output)` returns boolean by comparing sorted multisets (case-insensitive for meds/negation/laterality; exact numeric string for numbers).

If mismatch: discard LLM output, apply deterministic-only, and surface inline note "Structure formatting unavailable for this pass." in the Format tab (no toast).

## 4. `ReviewTray.tsx` Format tab UX

Replace current Format tab body with:
- **Toggle chip row**: Punctuation · Sentence Case · Abbreviations+ · Paragraphs · Spelling · Structure. Chips styled like existing filter chips; Spelling/Structure marked with a small AI dot.
- **Active section indicator**: shows which SOAP section (Subjective/Objective/Assessment/Plan) is currently active.
- **"Format section"** primary button: runs pipeline on active section (deterministic first, then LLM if Spelling or Structure on, then integrity check).
- **Before/After preview**: two stacked panes with subtle bg tint on changed lines (word-level diff via simple LCS or line-diff). Preview renders `**bold**` as real `<strong>`, `# HEADER` lines as uppercase bold headers, `- ` lines as bulleted list — preview only.
- **Apply / Cancel / Undo**:
  - Apply → strips `**`, converts headers to plain UPPERCASE lines, bullets remain `- `, paragraphs remain blank-line separated → splices plain text into the active SOAP textarea. Stores prior text in `undoRef`.
  - Cancel → dismisses preview, no change.
  - Undo button remains visible in Format tab until next dictation commit or a manual textarea edit invalidates it.
- **Inline warning slot**: shows "Structure formatting unavailable for this pass." when integrity check fails.

## 5. Wiring in `EmrDashboard.tsx`

- Pass active-section id + section text getter/setter to `ReviewTray`.
- On dictation commit or manual textarea `onChange`, clear `undoRef` for that section.
- No changes to dictation, verification, or existing textarea rendering — textarea remains plain text, no markdown ever written.

## Files touched

- `src/components/demo/format-options.ts` — extended
- `src/components/demo/formatIntegrity.ts` — new
- `src/lib/format-assist.functions.ts` — new
- `src/components/demo/ReviewTray.tsx` — Format tab rewrite
- `src/components/demo/EmrDashboard.tsx` — pass active-section props, undo invalidation

## Non-goals

- No change to dictation, verify.ts, medMatcher, or Quick Lookup.
- No markdown persistence in the note.
- No toasts; only inline messaging in the Format tab.
