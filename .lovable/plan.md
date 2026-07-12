# Scale down the hero visual stack by ~25% on desktop

## Goal
On larger screens, reduce the visual weight of the three hero UI cards (EHR Workspace card, Floating Dictation panel, Suggested Medications panel) by roughly 25% while preserving their exact proportions, spacing, and typography scale. Mobile remains unchanged (panels are already hidden on mobile).

## What we will do

### 1. Wrap the desktop hero visual stack in a scaled container
- In `src/routes/index.tsx`, keep the existing `WorkspaceCard`, `FloatingDictation`, and `SuggestedMeds` components unchanged.
- Wrap the entire desktop-only visual block inside the right column in a new container that applies `transform: scale(0.75)`.
- Use `transform-origin: center top` so the composition scales down from its top center, keeping the overlay cards aligned with the workspace card.
- Center the scaled block horizontally within the right column with `flex justify-center`.

### 2. Tighten the surrounding layout
- Because CSS `transform: scale` does not reduce the element’s layout footprint, the right column would still reserve the original vertical space.
- Add a negative bottom margin or explicit height wrapper to reclaim the extra whitespace and keep the hero section compact.
- Verify the overlap positions of the floating dictation and medications panels still read correctly after scaling.

### 3. Keep proportions and avoid manual re-sizing
- Do not manually shrink individual widths, paddings, or font sizes inside the cards.
- Scaling the whole stack guarantees that borders, shadows, rounded corners, waveform bars, and text all shrink proportionally.

## Scope and exclusions
- Only affects the desktop hero visual stack (the right-hand column of the hero section).
- Mobile layout stays exactly as is: workspace/dictation/meds panels remain hidden below `md`.
- No changes to copy, colors, tokens, section order, or other sections.

## Files touched
- `src/routes/index.tsx` — add a scaled wrapper around the existing desktop hero visual block.

## Verification
- Check the desktop preview at 1440px: the three cards should appear ~25% smaller but otherwise identical in composition.
- Check the mobile preview: no visual cards appear, and no regressions in hero text or CTAs.
