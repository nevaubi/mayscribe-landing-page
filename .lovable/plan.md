## Plan

Fix the current Deepgram dictation failure by correcting the browser WebSocket authentication method.

### What I found
- `/api/deepgram-token` is now returning `200`, so the backend token proxy is working.
- The WebSocket fails because the client currently sends the temporary token as a `?token=` query parameter, which Deepgram rejects with `401 Invalid credentials`.
- A direct handshake test confirms Deepgram accepts the temporary token when sent as browser WebSocket subprotocol auth: `["bearer", accessToken]`.

### Changes to make
1. Update `src/components/demo/useDictation.ts`:
   - Replace query-string token auth with `new WebSocket(DG_URL, ["bearer", accessToken])`.
   - Remove the browser REST handshake probe to `api.deepgram.com`, since it is CORS-blocked and only creates noisy console errors.
2. Keep the existing token proxy and EMR dictation UI unchanged.
3. Verify the token endpoint still returns successfully and the WebSocket opens with the corrected auth path.

### Expected result
- Pressing F2 / the mic button should connect instead of closing with `1006`.
- The CORS probe error should disappear.
- Dictation can stream into the active SOAP field as originally intended.