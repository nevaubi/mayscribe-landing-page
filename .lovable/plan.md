## Goal

Get `/demo` live dictation working end-to-end. Two independent bugs are likely stacked:

- `/api/deepgram-token` returns 502 → upstream `POST /v1/auth/grant` is failing.
- Even with a token, the WebSocket to `wss://api.deepgram.com/v1/listen` is opened with the wrong subprotocol.

## Step 1 — Diagnose the 502 (no code change)

Once in build mode, hit our own endpoint against the preview and inspect the upstream response verbatim:

- Curl `POST https://<preview>/api/deepgram-token` with an allowed `Origin` header and log the status + body.
- Temporarily have the handler forward Deepgram's status + response text on failure (instead of a flat `502 Upstream error`) so we can see what Deepgram is actually saying (`invalid credentials`, `insufficient scope`, `plan not entitled`, etc.). Revert this verbose surface after diagnosis.

Two probable outcomes:

a) **Key is wrong type / lacks scope.** `/v1/auth/grant` requires a Deepgram-issued **Project API Key** with the "keys:write" (member) scope so it can mint a short-lived token. A restricted key with only `usage:write` (streaming) will 401/403 here. Fix: user rotates `DEEPGRAM_API_KEY` in Deepgram to a Project key with the right scope; no code change.

b) **Endpoint / payload shape mismatch.** In that case adjust the handler to match what the real response returns (some accounts get `{ key, expires_in }` rather than `{ access_token }`).

## Step 2 — Fix the WebSocket subprotocol

Independent of the token issue, browser `WebSocket(url, protocols)` auth against `wss://api.deepgram.com/v1/listen` uses the two-element subprotocol pair `["token", "<token>"]`, not `["bearer", "<token>"]`. Update `src/components/demo/useDictation.ts`:

```ts
socket = new WebSocket(DG_URL, ["token", accessToken]);
```

If that still closes with 1008, fall back to sending the token via the query string on connect — but only after confirming the token itself is valid via Step 1.

## Step 3 — Better error surfacing in the UI

Right now the hook collapses every failure into "Dictation unavailable — retry" or "session expired". While we're debugging, log `event.code` and `event.reason` from `socket.onclose` and the response text from the token fetch to the console so we can tell the two failure modes apart without another round-trip. Keep the user-facing copy the same.

## Step 4 — Verify

- In incognito on `mayscribe.com/demo`, unlock, press F2, speak.
- Confirm: token endpoint returns 200 JSON, socket opens (status flips `connecting` → `listening`), waveform reacts to real audio, interim italic text updates, finals splice into the active SOAP textarea at the caret with the light blue flash.
- Republish.

## Not in scope

No landing-page, gate, or EMR-layout changes. The stale mayscribe.com view you saw is browser cache — incognito already shows the deployed build, so no publish action is needed for that.

## Question before I execute

Can you confirm the `DEEPGRAM_API_KEY` you saved is a **Deepgram Project API Key created in the Deepgram console** (not, e.g., a member/user login token or a key scoped only to streaming)? If you're not sure, I'll surface the exact upstream error message from Step 1 first and we'll know from that response whether the key needs to be rotated.
