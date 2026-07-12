
## What the new errors mean

Close code **1006** = the WebSocket handshake was aborted before Deepgram could return a normal close frame. No `4001/4008/1008` means it isn't the auth-scope error we hit before. Two likely causes, in order:

1. **Subprotocol auth is being rejected.** Deepgram's browser-token pattern (`new WebSocket(url, ["token", tempToken])`) is finicky — some Deepgram endpoints only accept the temp token as a **query param** (`?token=...`), and browsers give exactly this `1006 + no reason` when the server refuses the subprotocol.
2. **The `/api/deepgram-token` endpoint itself is misbehaving.** My server-side probe just returned **HTTP 307** (a redirect) instead of a JSON body — that would make the client parse a redirect page as JSON, extract `undefined` as the token, and produce exactly this failure mode. I want to confirm this in build mode before assuming (1).

## Plan

### Step 1 — Verify the token endpoint end-to-end
In build mode, hit `/api/deepgram-token` from the sandbox with the exact origin the browser uses, follow redirects, and log the JSON. If it returns a real `access_token`, the token layer is fine and the problem is (1). If not, fix the route first.

### Step 2 — Switch to Deepgram's query-param auth for browser sockets
Regardless of Step 1, move token auth off the subprotocol and onto the URL, which is Deepgram's documented, browser-friendly path and eliminates one whole class of handshake failures:

```
wss://api.deepgram.com/v1/listen?token=<TEMP_TOKEN>&model=nova-3-medical&...
```

Construct the socket with **no** subprotocol argument. Keep everything else in `useDictation.ts` unchanged (MediaRecorder, analyser, commit flow, F2, DictationStrip).

### Step 3 — Surface the real close reason
Deepgram sometimes sends the reason in the close frame but the browser only exposes it when the handshake completes. Add a one-shot `fetch("https://api.deepgram.com/v1/projects", { headers: { Authorization: "Token <tempToken>" }})` probe *only if* the socket closes with 1006 within 1 second — the HTTP response body tells us exactly why (bad token, wrong scope, expired, region-blocked). Log it and stop; do not retry automatically.

### Step 4 — Verify
Load `/demo` in incognito on the published site, press F2, confirm:
- Network tab shows a 200 from `/api/deepgram-token` with `access_token` in the JSON
- WS to `api.deepgram.com` shows `101 Switching Protocols`
- Console logs interim transcripts as you speak

No visual changes. No landing page or auth changes.

## Files touched (build mode)

- `src/components/demo/useDictation.ts` — switch to `?token=` URL auth, drop the `["token", ...]` subprotocol arg, add the 1-second post-close probe with clear console output.
- `src/routes/api/deepgram-token.ts` — only if Step 1 shows the 307 redirect is originating here (likely a same-origin/trailing-slash check); leave alone otherwise.

## Not doing
- No change to landing page, `/whitepaper`, `/demo` gate, or EmrDashboard UI.
- No rotation of `DEEPGRAM_API_KEY` — you already installed the admin-role key.
- No fallback to raw API key in the browser.
