## Plan

1. **Stabilize dictation start/stop/restart**
   - Make stopping fully reset the microphone, recorder, socket, status, interim text, and timer before a new start is allowed.
   - Prevent stale WebSocket close/error callbacks from overwriting the next session state.
   - Add a short reconnect-safe session guard so F2/mic can stop and start repeatedly.

2. **Improve live streaming text behavior**
   - Treat interim transcript as a temporary preview instead of repeatedly inserting it into the SOAP field.
   - Keep final Deepgram results as the only committed text.
   - Clear interim text reliably on final result, stop, error, or restart.

3. **Fix caret-aware insertion**
   - Track the active textarea and caret immediately before dictation starts.
   - Insert finalized text at the last known caret position, with clean spacing/punctuation handling.
   - Restore focus and caret position after insertion without forcing the textarea to jump awkwardly.

4. **Make UI feedback clearer**
   - Keep the floating dictation strip visible while connecting/listening/error.
   - Show clean status messages for mic blocked, connection failure, session expired, and restart needed.
   - Preserve the existing flash feedback when final text lands in the active SOAP section.

5. **Verify**
   - Check that F2 and the mic button can start, stop, and restart.
   - Confirm final transcript inserts into the selected SOAP section at the caret.
   - Confirm no duplicate/garbled text is committed from interim streaming.