# Format Section — Reliability Overhaul

Goal: when the user clicks **Format section**, spelling, punctuation, spacing, and abbreviation fixes actually land — not silently discarded.

## 1. New provider: Fireworks GLM-5.2

Add secret `FIREWORKS_API_SECRET` via `add_secret` (user will paste). Rewrite `src/lib/format-assist.functions.ts`:

- Endpoint: `https://api.fireworks.ai/inference/v1/chat/completions`
- Model: `accounts/fireworks/models/glm-5p2`
- `reasoning_effort: "none"`, `max_tokens: 4096`, `temperature: 0`, `top_k: 40`
- Timeout: 6s (up from 3s), single retry on network/5xx/parse failure
- Response format: JSON object `{ formatted: string }`
- System prompt kept — preserve numbers, meds, negations, laterality. Add explicit instruction to fix ordinary spelling AND spacing/whitespace/casing errors.
- Read `process.env.FIREWORKS_API_SECRET` inside `.handler()` only.

Remove Lovable AI Gateway call from format path (dictation-assist still uses it).

## 2. Defaults-on Format button

`ReviewTray.tsx` Format tab:
- On mount and each time the tab is opened, pre-select **Punctuation, Sentence case, Units & abbrev., Abbreviations+, Spelling, Structure**. User can uncheck any.
- "Format section" always runs the full enabled set. No behavior change if user unchecks.
- Keep the *Paragraphs* chip opt-in (it's a structural change users may not want).

## 3. Loosened integrity check

`formatIntegrity.ts`:
- Before multiset comparison, normalize each protected token:
  - Numbers-with-units: collapse whitespace between number and unit → `5mg` == `5 mg`. Lowercase unit. `mL`→`ml`, `MG`→`mg`, etc.
  - Meds: lowercase, strip trailing punctuation.
  - Negations/laterality: lowercase.
- Meds/negations/laterality remain strict on identity — only whitespace/case is normalized away.
- Numeric values must still match exactly (5 ≠ 50).
- If mismatch: still fall back to deterministic-only + inline note (unchanged UX).

## 4. Stronger deterministic spacing (runs regardless of LLM outcome)

Extend `applyPunctuation` in `format-options.ts`:
- Collapse runs of internal spaces (`  ` → ` `) even mid-sentence.
- Force single space after `,;:` when followed by a letter/digit.
- Fix missing space after sentence terminator when followed by capital letter (`end.Next` → `end. Next`).
- Collapse `\n{3,}` → `\n\n`.
- Trim trailing space on each line.
- Ensure exactly one space between a number and its unit token (uses same regex family as Units & abbrev.).

Run this pass **twice** in the pipeline: once before LLM (clean input) and once after LLM (clean output), so even a discarded LLM result still yields clean spacing.

## 5. Pipeline order (final)

```
input
  → deterministic pre-clean (punctuation + spacing always)
  → applyDeterministicFormat(text, enabled toggles minus spelling/structure)
  → if spelling OR structure enabled:
      → Fireworks GLM-5.2 call
      → integrity check (loosened)
      → on pass: use LLM output; on fail: keep deterministic result + inline note
  → deterministic post-clean (punctuation + spacing always)
  → preview shows before/after; Apply strips markdown → textarea
```

## 6. Files touched

- `src/lib/format-assist.functions.ts` — swap to Fireworks GLM-5.2, retry, 6s timeout
- `src/components/demo/format-options.ts` — stronger `applyPunctuation`, exported `deterministicClean()` helper for pre/post passes
- `src/components/demo/formatIntegrity.ts` — normalization before multiset compare
- `src/components/demo/ReviewTray.tsx` — Format tab defaults-on, pre/post deterministic passes wired into pipeline
- New secret: `FIREWORKS_API_SECRET` (requested via `add_secret` at start of build)

## Non-goals

- No change to dictation, verify, medMatcher, Quick Lookup, or lexicon.
- No change to Apply/Undo, preview rendering, or plain-text conversion.
- Lovable AI Gateway still powers dictation-assist; only the Format path moves to Fireworks.

## Answer to your question, plainly

Today: two-step process — a **regex pass** (only for chips you toggled on) followed by an **LLM call** (Gemini 3.1 Flash Lite, only if Spelling/Structure chips on). The LLM has a 3s timeout, small model, and any change to numbers/units (even `5mg`→`5 mg`) makes an integrity guard throw away the whole LLM result, so spelling fixes silently vanish. Combined with chips being off by default, most "Format" clicks were doing only regex punctuation. This plan swaps in a smarter/faster model (GLM-5.2 via Fireworks), turns the useful chips on by default, loosens the guard so trivial spacing normalizations survive, and hardens the always-on deterministic spacing pass so errors don't slip through even when the LLM call fails.
