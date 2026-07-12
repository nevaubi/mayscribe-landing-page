## Demo page polish + mobile gate

### 1. Hide scrollbar in EMR left sidebar
In `src/components/demo/EmrDashboard.tsx`, find the left sidebar scroll container and add a `no-scrollbar` utility (hides scrollbar in WebKit/Firefox while keeping scroll functional). Register the utility in `src/styles.css`:
```css
@utility no-scrollbar {
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
```

### 2. Refine `/demo` page layout (`src/routes/demo/index.tsx`)
- Replace the plain "Test below" header with a cleaner, more polished title block:
  - Small kicker "DEMO" (Inter Bold 11px, tracked, `#0D57FA`)
  - H1 "MayScribe EMR preview" (Inter Semibold ~24px, `#061338`)
  - One-line subtext "Interactive mock — explore the workspace below." (14px, `#46587E`)
  - Tighter vertical rhythm, ~32px gap from title block to the EMR frame
- Center the EMR mock inside a `max-w-[1200px]` container with `px-6 lg:px-10` side padding
- Scale the EMR component down to ~90% via a `transform scale-[0.9] origin-top` wrapper (with matching negative margin to remove the transform gap), so it feels less bulky while keeping proportions
- Add generous bottom padding so it doesn't hug the viewport edge

### 3. Mobile gate for demo routes
Both `src/routes/demo/index.tsx` and `src/routes/demo/unlock.tsx`:
- Wrap page content with a responsive guard: on `< lg` breakpoints, render only a centered card with the text **"Must use desktop for demo access"** (styled with existing brand tokens — Ink title, secondary body). Hide the actual EMR/unlock UI on mobile with `hidden lg:block`.
- Keeps the passcode gate and EMR intact on desktop; mobile visitors always see the notice.

### Scope
Presentation-only changes. No auth, server function, or EMR data changes.
