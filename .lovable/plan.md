
## Goal

Make dictation feel like a system-level floating popup (not part of the EMR chrome), speed up and smooth the streaming, remove the header mic button, keep the note textarea completely clean (no in-text highlights), and greatly expand the clinical knowledge base.

## 1. Float the dictation popup above the EMR (not inside it)

Currently `DictationStrip` is rendered inside the SOAP editor container with `position: absolute`, so it lives inside the note card. It also sits behind the site scroll-snap layer.

- Change `src/components/demo/DictationStrip.tsx` to render into a portal on `document.body` with `position: fixed`, `bottom: 24px`, `left: 50%`, high `z-index` (e.g. `z-[9999]`), no layout impact on the EMR.
- Move the `<DictationStrip />` mount out of the note editor `<div className="p-0 relative">` block up to the top level of `EmrDashboard` (sibling of the outermost flex container).
- Remove the "Section: subjective/…" absolute badge that also lives inside the editor; move that label into the popup itself so nothing floats over the note.

## 2. Redesign the popup (cleaner, more polished)

New layout inside the fixed popup, all on one row on desktop and compact:

```
┌────────────────────────────────────────────────────────────────┐
│ ● Listening   00:28   S — Subjective   ▁▂▅▇▅▂▁   "...interim"  ✕ │
└────────────────────────────────────────────────────────────────┘
```

- Softer shadow, 12px radius, white surface, 1px `#E6EEF8` border, backdrop blur.
- Status pill uses a small pulsing dot instead of the current large amber "Connecting" text block; color: emerald when listening, amber when connecting, red on error.
- Section chip shows which SOAP section the transcription is targeting (S/O/A/P).
- Waveform: reduce to 14 bars, smoother interpolation, easing at 60fps via `requestAnimationFrame` instead of the 66ms `setInterval` sampler (see §4).
- Interim transcript preview area, single line, right-aligned scroll, monospace, muted — this is where the "highlight" (see §5) now lives: interim words are dim, the most recent final phrase flashes briefly before disappearing. No highlighting inside the note textarea.
- Small "F2 to stop" hint under the stop button on hover only.
- Auto-hide when `status === "idle"` after a 200ms fade.

## 3. Remove the toolbar mic button

- In `EmrDashboard.tsx`, delete the mic `<button>` block in the New Note header (the `toggleDictation` button and the sibling "Microphone blocked" inline note). F2 remains the only way to start/stop dictation. Keep the `toggleDictation` function since F2 still uses it. The floating popup already carries a Stop (✕) affordance and can show the mic-blocked message inline.
- Remove `Mic`/`MicOff` imports if no longer used.

## 4. Faster, smoother streaming

Two axes: (a) reduce time-to-interim, (b) smooth the waveform.

- `useDictation.ts` Deepgram URL: tune for lower latency
  - `endpointing=180` (was 300)
  - `utterance_end_ms=1000` (was 1200)
  - keep `interim_results=true`
- MediaRecorder timeslice: `rec.start(80)` (was 150). Trade-off: more frequent small packets; fine for opus.
- Prefer `audio/webm;codecs=opus` with `audioBitsPerSecond: 32000` for smaller, faster packets on typical mic input.
- Interim throttle: right now every interim event triggers a React setState. Throttle `setInterim` to ~16ms via `requestAnimationFrame` batching (coalesce rapid interims) so the popup preview updates smoothly without churn.
- Waveform driver: replace `setInterval(66ms)` sampler with a persistent `requestAnimationFrame` loop; expose an interpolated level (`current += (target-current) * 0.35`) so bars glide instead of stepping.

## 5. Move ALL highlights out of the textarea

The mirror overlay currently paints holds, dismissed spans, flash range, and medref dotted underlines directly on top of the note textarea. Per request, the note field must render as plain text.

- In `EmrDashboard.tsx`, remove the `<TextOverlay …>` component call inside the SOAP section render. Also remove the `ring-2 ring-inset ring-[#0D57FA]` "listening" ring on the textarea — the popup indicates listening state.
- Keep the `TextOverlay` component file for now but stop using it in the editor. (It stays available if we want to re-enable it later; delete only if the plan lands cleanly.)
- Move the "commit flash" feedback into the popup preview: when a final commits, briefly render the committed phrase in the popup's preview area with a subtle blue background for 500ms, then clear.
- Hover cards for known meds: attach to the Review Tray card and to the Quick Lookup panel results only. The textarea is untouched.
- Review Tray continues to list holds and dismissed items exactly as today; that is the sole in-page surface for verification affordances.

Behavioral note: hold/dismissed anchors are still tracked in state so the Review Tray works and Sign & Submit stays gated. We just don't paint them over the note.

## 6. Vastly expanded clinical knowledge base

Extend `src/components/demo/lexicon.ts` and add a new sibling `clinical-knowledge.ts` so the added surface area doesn't bloat one file.

### 6a. `lexicon.ts` — meds table growth

Expand `MEDS` from ~65 to ~250 entries across these classes (curated, US brand + generic + common aliases, with realistic `typicalDoseRange`, `routes`, `freqs`):

- Cardiovascular: full beta-blockers, ACEi, ARBs, ARNI (sacubitril/valsartan), CCBs, nitrates, antiarrhythmics, diuretics (loop/thiazide/K-sparing), lipid agents (statins, ezetimibe, PCSK9), antiplatelets, DOACs, warfarin, heparins.
- Endocrine: insulins (regular, NPH, glargine, degludec, detemir, lispro, aspart, glulisine), sulfonylureas, biguanides, DPP-4, GLP-1 (semaglutide, dulaglutide, liraglutide, tirzepatide), SGLT2 (empagliflozin, dapagliflozin, canagliflozin), thyroid (levothyroxine, liothyronine, methimazole, PTU), corticosteroids (prednisone, prednisolone, methylprednisolone, dexamethasone, hydrocortisone, fludrocortisone).
- Pulmonary: SABA, LABA, ICS, LAMA, LTRA, biologics (omalizumab, mepolizumab), theophylline.
- GI: PPIs, H2 blockers, antiemetics (ondansetron, prochlorperazine, promethazine, metoclopramide), laxatives, antidiarrheals.
- Neuro/Psych: SSRIs, SNRIs, TCAs, bupropion, mirtazapine, trazodone, atypical antipsychotics (olanzapine, quetiapine, risperidone, aripiprazole, clozapine), typical antipsychotics (haloperidol), mood stabilizers (lithium, valproate, lamotrigine, carbamazepine, oxcarbazepine), AEDs (levetiracetam, phenytoin, topiramate, gabapentin, pregabalin), stimulants, benzodiazepines, hypnotics (zolpidem, eszopiclone), Parkinson meds (carbidopa/levodopa, ropinirole, pramipexole).
- Pain: acetaminophen, NSAIDs (ibuprofen, naproxen, ketorolac, celecoxib, meloxicam, diclofenac), opioids (morphine, oxycodone, hydrocodone, hydromorphone, fentanyl patches, methadone, tramadol, tapentadol, buprenorphine/naloxone).
- Infectious disease: penicillins (amoxicillin, amoxicillin-clavulanate, piperacillin-tazobactam, nafcillin), cephalosporins (cefazolin, cefepime, ceftriaxone, cefdinir, cephalexin), carbapenems (meropenem, ertapenem), fluoroquinolones (ciprofloxacin, levofloxacin, moxifloxacin), macrolides (azithromycin, clarithromycin), tetracyclines (doxycycline, minocycline), sulfa (TMP-SMX), metronidazole, clindamycin, linezolid, daptomycin, vancomycin, aminoglycosides (gentamicin, tobramycin), antifungals (fluconazole, micafungin, amphotericin B, voriconazole), antivirals (acyclovir, valacyclovir, oseltamivir, remdesivir), HIV agents, TB regimen.
- Hematology/Oncology: chemo omitted except commonly co-managed agents (methotrexate, hydroxyurea, tamoxifen, letrozole, anastrozole).
- Renal: phosphate binders, cinacalcet, erythropoiesis-stimulating agents, sodium bicarbonate.
- Women's health / OB: OCPs, hormone therapy, magnesium sulfate, oxytocin, terbutaline, misoprostol.
- Reversal / emergency: naloxone, flumazenil, glucagon, protamine, vitamin K, calcium gluconate, dextrose.

Add high-value LASA pairs beyond current 15, e.g. `hydromorphone/morphine`, `bupropion/buspirone`, `Zyrtec/Zyprexa`, `Lamictal/Labetalol`, `Novolin/Novolog`, `Toradol/Tramadol`, `Xeljanz/Xarelto`, `Humalog/Humulin`, `Neurontin/Norvasc`, `Prilosec/Prozac`.

### 6b. New file `src/components/demo/clinical-knowledge.ts`

- `CONDITIONS` — a curated list of ~300 conditions with `name`, `icd10`, `aliases`, `system` (cardio/pulm/GI/…). Used by lexicon detection AND by the local fallback in `QuickLookup` when NLM is unreachable. Sourced from the existing shortlist plus a compact curated set (no PHI, no external data files at runtime).
- `ROUTES`, `FREQUENCIES`, `UNITS` canonical maps expanded (e.g. `q4h`, `q6h`, `qod`, `ac`, `pc`, `hs`, `stat`, `now`, `once`, `x1`, `x3 days`, `taper`).
- `ABBREVIATIONS` — a normalization dictionary (e.g. `SOB`→"shortness of breath", `CP`→"chest pain", `N/V`→"nausea and vomiting", `HTN`, `DM2`, `CAD`, `CHF`, `HFrEF`, `HFpEF`, `COPD`, `PNA`, `UTI`, `AKI`, `CKD`, `MI`, `CVA`, `TIA`). Used only for verifier confidence, never rewrites the user's text — expansions surface as candidates in the Review Tray when Deepgram's transcript matches the short form.

### 6c. Formatter upgrades (`EmrDashboard.tsx` `normalizeMedicalTokens` + `formatDictationInsert`)

- Additional frequency tokens: `q4h`, `q6h`, `q8h`, `q12h`, `qod`, `ac`, `pc`, `hs`, `qam`, `qpm`, `stat`, `x1`, `x3 days`, etc.
- Additional units: `IU`, `mEq`, `mmol`, `L`, `kg`, `cm`, `mm`, `bpm`, `mmHg`.
- Dose ratios: normalize `mg per kg` / `milligrams per kilogram` → `mg/kg`; `puffs`, `tabs`, `caps`, `sprays`.
- Concentrations: `x %` → `x%`; `x over y` when followed by `mmHg` → `x/y mmHg`.
- Number handling: fold spoken multi-word numbers Deepgram missed (`one hundred twenty over eighty` → `120/80`) — small deterministic pass, capped.
- Sentence boundaries: after headings like `Assessment:` or `Plan:` capitalize the next word; new-line handling preserved.

The verifier (`verify.ts`) uses the expanded lexicon automatically since `detectAll` iterates `MEDS`. No API contract changes.

## Files touched

- `src/components/demo/DictationStrip.tsx` — rewrite: portal to body, fixed positioning, redesigned layout, section chip, commit-flash slot, throttled interim rendering, RAF waveform interpolation.
- `src/components/demo/useDictation.ts` — endpointing/utterance_end tuning, 80ms timeslice, opus bitrate, RAF-batched interim callback, RAF level sampling (drops the setInterval).
- `src/components/demo/EmrDashboard.tsx` — remove toolbar mic button, remove `TextOverlay` from SOAP editor, remove listening ring, remove in-editor section badge, move `<DictationStrip />` out of the note card to the top-level of the component, extend formatter tokens/units.
- `src/components/demo/lexicon.ts` — expand `MEDS`, `LASA`, `UNITS`; add extra frequency/route regex tokens in `detectAll`.
- `src/components/demo/clinical-knowledge.ts` — new: `CONDITIONS`, `ABBREVIATIONS`, `ROUTES`, `FREQUENCIES`, `UNITS`.
- `src/components/demo/QuickLookup.tsx` — fallback path uses the new `CONDITIONS` list when the NLM conditions endpoint fails (mirrors existing MEDS fallback).

No route changes, no server changes, no new deps.

## Out of scope

- No changes to the Deepgram token proxy (`src/routes/api/deepgram-token.ts`).
- No changes to Review Tray behavior beyond the fact that it stays the only in-page surface for holds.
- No landing page or whitepaper changes.
