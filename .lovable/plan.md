# Fix: "PAtient reports…" double-capitalization

## Root cause

`formatDictationInsert` in `src/components/demo/EmrDashboard.tsx` (line 190) tries to sentence-case the first letter of an inserted chunk:

```ts
text = text.replace(/([a-z])/, (_c, ch) => ch.toUpperCase());
```

The regex `/([a-z])/` is **unanchored**. Deepgram (with `smart_format`+`punctuate`) already returns capitalized sentences, e.g. `"Patient reports chest pain."`. The regex then scans past the already-uppercase `P` and matches the **first lowercase letter it finds** — the `a` in `Patient` — producing `"PAtient reports chest pain."`. Same thing happens for any capitalized first word: `"She denies…" → "SHe denies…"`, `"No acute…" → "NO acute…"`.

## Fix

Anchor the regex to the start of the string so it only runs when the first character is actually lowercase.

`src/components/demo/EmrDashboard.tsx`, inside `formatDictationInsert`:

```ts
if (shouldCap) {
  text = text.replace(/^([a-z])/, (_c, ch: string) => ch.toUpperCase());
}
```

One-character change: `/([a-z])/` → `/^([a-z])/`.

## Verify

After the edit, dictate a short phrase like "patient reports chest pain" into an empty section — it should insert as `Patient reports chest pain` (only the first letter capitalized), and dictating over an already-capital lead like `"She denies…"` should stay `"She denies…"`, not `"SHe denies…"`.
