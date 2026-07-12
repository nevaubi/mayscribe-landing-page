## Demo page: scroll snap + EMR placeholder

### 1. Anchored scrolling on `/demo` (desktop only)
In `src/routes/demo/index.tsx`:
- Make the desktop `<main>` a scroll-snap container: apply `lg:snap-y lg:snap-proximity` and set it to `h-screen overflow-y-auto` on `lg` so the page owns the scroll (required for snap to feel "sticky"). Keep mobile as normal flow.
- Wrap the EMR frame in a snap section: `lg:snap-center lg:snap-always min-h-screen flex items-center justify-center` so once the user scrolls the EMR into view, proximity snap gently pulls it to vertical center and small trackpad flicks don't drift it off-center.
- Wrap the title block in its own `lg:snap-start` section so it still gets a natural resting point at the top.

Net effect: on large screens, quick up/down scrolls settle onto either the title or the centered EMR instead of landing between them. No JS, pure CSS scroll-snap.

### 2. EMR note field: empty with dictation placeholder
In `src/components/demo/EmrDashboard.tsx`:
- Update the initial `soap` state so all four sections (`subjective`, `objective`, `assessment`, `plan`) start as empty strings.
- Add `placeholder="Make sure your mic is enabled. Press Ctrl + space to dictate."` to the `<textarea>` (line 363) so the light placeholder shows on whichever SOAP tab is active until the user types.

### Scope
Presentation-only. No routing, auth, or data changes.
