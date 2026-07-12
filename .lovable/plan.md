# Plan: EMR mock UI on /demo

Reuse the exported Figma component (`App.tsx`, 679 lines, pure Tailwind + `lucide-react` only — no extra shadcn or image deps) as the body of the already-passcode-gated `/demo` route.

## Steps

1. **Add the component**
   - Create `src/components/demo/EmrDashboard.tsx` with the contents of the uploaded `src/app/App.tsx`, exported as a named component `EmrDashboard`.
   - Change its outer wrapper from `h-screen w-screen overflow-hidden` to `min-h-screen w-full overflow-hidden` so it lives inside the demo page instead of hijacking the viewport.
   - No import changes needed: it only imports from `lucide-react` (already installed) and uses standard Tailwind tokens the project already defines.

2. **Wire it into `/demo`**
   - Update `src/routes/demo/index.tsx` (keeps existing `isDemoUnlocked` loader + redirect and `noindex,nofollow` head).
   - Replace the blank `<main>` with:
     - A slim header bar: `Test below` (matches your ask for "Very simple page header").
     - `<EmrDashboard />` rendered below it.

3. **Leave untouched**
   - Passcode gate, `demo_passcodes` table, `/demo/unlock` form, `robots.txt` — all stay as-is.
   - The uploaded zip's own `package.json`, theme CSS, and duplicate shadcn `ui/` folder are ignored; the project's existing tokens and components already cover what the mock renders.

## Notes / caveats

- The mock is a static visual — no data fetching, no interactivity beyond local `useState` toggles that already exist in the file. Nothing calls the backend.
- It's designed for a wide desktop viewport (multi-pane layout with fixed heights). On narrow screens it will scroll horizontally; that matches the Figma export and I won't retrofit responsiveness unless you ask.
- A few colors are hardcoded hex (`#12294D`, `#1B4F8A`, etc.) rather than semantic tokens. I'll keep them verbatim so the render matches Figma exactly; happy to tokenize later if you want.
