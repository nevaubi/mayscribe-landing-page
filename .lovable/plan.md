# Mobile refinements to the MayScribe landing page

Scope: mobile only (below the `md` breakpoint, ~768px). Desktop layout stays exactly as it is now.

## 1. Hero — hide the visual stack on mobile
In `src/routes/index.tsx`, inside the `Hero` right column:
- Hide the `WorkspaceCard` on mobile, show from `md` up.
- Remove the mobile-only stacked block that renders `FloatingDictation` and `SuggestedMeds` under the workspace card.
- Keep the desktop absolute-positioned overlays untouched.

Result on mobile: hero shows only the eyebrow-free headline, subcopy, two CTAs, and the three trust phrases. No card, no waveform panel, no meds panel.

Also tighten the hero on mobile:
- Reduce top/bottom padding (`pt-8 pb-24` → `pt-4 pb-14` on mobile, keep desktop values via `lg:`).
- Slightly smaller H1 on mobile (44px → 38px) and tighter line-height.
- CTA buttons: full-width side-by-side row on mobile with `h-11` instead of `h-12`.
- Trust row: tighter gap and slightly smaller text on mobile.

## 2. Compliance — drop the middle card
Remove the "IN PROGRESS · SOC 2 Type I" card from the `cards` array in `Compliance`. Only "NOW · HIPAA-aligned, BAA-ready" and "PLANNED · SOC 1 and SOC 2 Type II" remain.

Grid becomes 2 columns from `md` up, single column on mobile. On desktop the two cards center under the heading with a comfortable max width so they don't stretch full-bleed.

Also update the footer strapline so it no longer implies an in-progress SOC 2 Type I:
- From: `HIPAA-aligned · BAA-ready · SOC 2 Type I in progress`
- To:   `HIPAA-aligned · BAA-ready · SOC attestations on roadmap`

(Compliance section body copy stays; it already reads cleanly without the middle card.)

## 3. Global mobile polish
Small, section-wide tightening to feel more enterprise/compact on phones — desktop unchanged:
- Section vertical padding on mobile: `py-[76px]` → `py-12` (keep 76px from `md` up) for Compliance, Security, and the CTA band.
- Section heading size on mobile: 32px → 26px, tighter tracking.
- Card interior padding on mobile: `p-6` → `p-5` for Compliance/Security cards.
- Nav: reduce header height on mobile from 72px to 60px, keep the gradient "Book a demo" button, hide "Sign in" on mobile (already hidden at `sm`, keep as is).
- CTA band on mobile: stack heading/body and buttons with `gap-5`, buttons become full-width; desktop row layout preserved.
- Footer on mobile: link row wraps to two lines cleanly with `gap-x-5 gap-y-2`.

## 4. Files touched
- `src/routes/index.tsx` — all of the above; no new components, no new dependencies.

Nothing else changes: tokens, colors, copy elsewhere, desktop composition, and section order stay identical.
