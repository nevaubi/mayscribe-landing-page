## Plan

### 1. Add hotkey to show/hide the Review popup
In `src/components/demo/EmrDashboard.tsx`:
- Add a `showReview` state (default `true`).
- Add a global key listener for **F1** that toggles `showReview`.
  - Only fire when the active element is not an editable field, or always treat F1 as a dedicated demo shortcut (typing focus is already inside the dictation input, and the panel toggle is more discoverable as a global key).
  - Prevent the browser's default F1 help behavior with `event.preventDefault()`.
- Wrap the `<ReviewTray … />` render so it only mounts when `showReview` is true.
- Keep F2 (dictation) and existing 1/2/3/Enter/Esc handlers untouched — those live inside ReviewTray and only fire while it's mounted, which matches the "hidden = no shortcuts" behavior.

### 2. Fix false "not a medicine prescription" flags on words like "and", "with"

Root cause is in `src/components/demo/lexicon.ts` → `findMed()`. It runs a Levenshtein-≤2 fuzzy match against every med name and every alias. Short aliases collide with common English words:
- `"and"` → alias `"asa"` (aspirin), distance 2 ⇒ flagged as med.
- `"with"` → alias `"hctz"`/others within length ±2, distance ≤ 2 ⇒ flagged.
- Similar collisions for `or`, `the`, `for`, `has`, `was`, `is`, `no`, etc.

Fixes in `lexicon.ts`:

1. **Add a `STOPWORDS` set** of common English function words + narrative verbs/adjectives that must never resolve to a medication (and, or, with, without, the, a, an, is, was, were, be, been, being, has, have, had, do, does, did, for, to, of, in, on, at, by, from, that, this, these, those, but, not, no, we, he, she, it, they, i, you, patient, presents, reports, denies, states, notes, feels, complains, exam, exams, plan, note, follow, up, blood, pressure, heart, rate, chronic, acute, severe, mild, moderate, history, follow-up).
2. **`findMed()` guardrails**:
   - Lowercase the token, and if it's in `STOPWORDS`, return `null` immediately (before exact or fuzzy match).
   - Keep exact match as-is.
   - For fuzzy match: require **token length ≥ 5** AND **candidate token length ≥ 5**. For tokens length 5–6 require Levenshtein ≤ 1; for length ≥ 7 keep ≤ 2. This preserves real typo tolerance ("lisinopr" → "lisinopril") while eliminating 3-letter alias collisions like `"asa"`, `"ntg"`, `"hctz"`.
3. **Belt-and-braces in `detectAll()`** med loop (line ~567): skip tokens where `STOPWORDS.has(tok.toLowerCase())` before calling `findMed`, so the same guard applies even if `findMed` is later reused elsewhere.

No changes to verify.ts, Gemini prompt, or the Review UI itself. The Review tray will continue to show only real med/dose/LASA/low-confidence spans — which now excludes ordinary English words.

### Files touched
- `src/components/demo/EmrDashboard.tsx` — F1 toggle + conditional ReviewTray mount.
- `src/components/demo/lexicon.ts` — STOPWORDS set, tightened `findMed` fuzzy rules, stopword guard in `detectAll`.
