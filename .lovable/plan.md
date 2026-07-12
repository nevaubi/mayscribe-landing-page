## Why F1 doesn't appear to work

The F1 keydown handler runs and flips `showReview`, but the Review Panel render is gated by a second condition:

```
{showReview && (holdEntries.length > 0 || status === "listening"
  || status === "connecting" || interim.length > 0) && <ReviewTray … />}
```

So if you press F1 while not dictating and with no held items, nothing renders — it looks like the hotkey is broken. Also, when the panel is already visible, F1 does hide it, but the next press won't bring it back unless one of those conditions is still true.

Additionally, some browsers/extensions swallow F1 before it reaches the window listener (built-in Help), which can make it feel intermittent.

## Fix

1. **Make F1 an unconditional toggle of the panel's visibility.**
   In `src/components/demo/EmrDashboard.tsx`, change the render gate to just `{showReview && <ReviewTray … />}`. The ReviewTray already handles the "nothing to review yet" empty state (it shows the transcript placeholder + "Transcript will appear here as you dictate…"). Default `showReview` stays `true`; F1 hides/shows regardless of dictation state.

2. **Harden the F1 listener** so the browser can't preempt it and it works from inside textareas:
   - Listen in the capture phase (`window.addEventListener("keydown", onKey, true)`) so it fires before the textarea/browser default.
   - Call `e.preventDefault()` **and** `e.stopPropagation()`.
   - Ignore when a modifier is held (so Ctrl+F1 etc. pass through).
   - Same treatment for F2 for consistency.

3. **Small affordance**: update the footer hint text near the dictation status to mention `F1 review · F2 dictate` so the shortcut is discoverable. (One-line copy change only.)

No other files change. No logic changes to verification, formatting, lexicon, or dictation.

### Files touched
- `src/components/demo/EmrDashboard.tsx` — relax ReviewTray render gate to `showReview` only; harden F1/F2 keydown listener; minor footer hint copy.