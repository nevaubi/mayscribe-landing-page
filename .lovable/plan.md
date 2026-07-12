## Plan

1. **Make dictation truly separate from the mock EMR**
   - Remove `DictationStrip` from inside the SOAP editor card.
   - Mount it once at the top/root of `EmrDashboard`, outside the EMR layout tree, relying on its portal so it floats above everything.
   - Remove the inline `QuickLookup` panel from the EMR right rail as well; convert it to a floating popup/portal that opens only when triggered from Review Tray lookup.

2. **Replace the current floating recorder UI with a cleaner command-style popup**
   - Fixed high-z-index panel centered near the bottom/front of the screen.
   - Clear status, active SOAP section, elapsed time, quiet countdown, waveform, interim text, and last committed text.
   - No visual integration into textareas, no highlights inside the text field, no EMR layout shifting.

3. **Fix streaming chunk ordering and insertion quality**
   - Track Deepgram result order using audio timestamps / sequence guards so older interim/final chunks cannot overwrite newer text.
   - Maintain a per-session committed transcript buffer to avoid duplicate or out-of-order final inserts.
   - Only commit stable final speech chunks; interim text remains preview-only in the floating popup.
   - Tighten spacing/punctuation rules so inserted SOAP text reads cleanly.

4. **Auto-close dictation after 2 seconds of quiet**
   - Add silence detection based on the live audio level.
   - If listening and audio stays below a quiet threshold for 2 seconds, stop dictation automatically.
   - Show a subtle “Quiet — closing…” countdown/state in the floating popup so it feels intentional.

5. **Keep Review Tray functional but detached**
   - Review Tray can remain in the editor footer for held verification items.
   - Medication “Lookup” opens the floating Quick Lookup popup instead of scrolling/focusing an embedded right-rail section.

6. **Sanity check**
   - Search for dangling embedded UI references.
   - Verify no dictation popup DOM is nested in the mock EMR card visually or structurally.
   - Verify F2 start/stop, auto-stop, and restart behavior still work.