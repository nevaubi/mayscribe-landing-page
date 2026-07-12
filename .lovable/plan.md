## Live medical dictation for the demo EMR

Scope: audio pipeline + on-EMR dictation UX. No landing page, demo gate, or other route changes. No EMR restyling — only additive dictation layer.

### 1. Token endpoint

I recommend a TanStack server route at `src/routes/api/deepgram-token.ts` instead of a Supabase edge function. Rationale: this stack routes app-internal logic through TanStack (already same-origin, no CORS setup needed), and "same-origin only" is trivially satisfied because the route lives on `mayscribe.com`. Supabase edge functions live on a different origin and would require an explicit allow-list, which is exactly what you said to avoid.

- POST-only handler, verifies `Origin`/`Referer` match the deploy host (localhost + `*.lovable.app` + `mayscribe.com`); rejects otherwise.
- Reads `DEEPGRAM_API_KEY` inside the handler.
- Calls `POST https://api.deepgram.com/v1/auth/grant` with `Authorization: Token <key>`.
- Returns `{ access_token, expires_in }` as JSON. No caching, no logging of the token.
- Adds `DEEPGRAM_API_KEY` via `add_secret` — you'll paste the value in the secure form.

If you'd rather have the Supabase edge function exactly as spec'd, say so and I'll swap in `supabase/functions/deepgram-token/index.ts` under 60 lines with an origin allow-list.

### 2. `src/components/demo/useDictation.ts`

Hook API:
```ts
type Status = "idle" | "connecting" | "listening" | "error";
useDictation(opts: {
  onInterim: (text: string) => void;
  onFinal: (text: string, words: DGWord[]) => void;
  onError?: (msg: string) => void;
}): { status; start(); stop(); audioLevel: number; expired: boolean; errorMessage: string | null }
```

Behavior:
- `start()`: fetch `/api/deepgram-token`, `getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })`, open `new WebSocket(url, ["bearer", accessToken])` with the exact query string in your spec.
- On `open`: start `MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" })` with `timeslice=250`; each `dataavailable` chunk sent as binary via `socket.send(blob)`.
- On `message`: JSON parse. For `type: "Results"`, read `channel.alternatives[0].transcript` and `words`; fire `onInterim` when `!is_final`, `onFinal` when `is_final` (skip empty). Handle `UtteranceEnd`, `SpeechStarted`, `Metadata`, `Error`.
- Audio level: `AudioContext` → `MediaStreamSource` → `AnalyserNode` (fftSize 256); `setInterval` at ~66ms computes RMS → normalized 0-1 → state.
- `stop()`: `socket.send(JSON.stringify({ type: "CloseStream" }))`, stop MediaRecorder, stop all tracks, close AudioContext, close socket. Zero persistence.
- Token expiry: if socket closes with 1008/4001 or the token TTL elapses mid-session, set `expired=true`, status=`"error"`, surface `"session expired, press F2 to resume"`.
- Cleanup on unmount via `useEffect` return.

### 3. Temporary F2 test wiring

Add a `useEffect` in `EmrDashboard` that listens for `keydown` F2 (ignored when target is inside inputs unless the mic isn't already running) — toggles `start()`/`stop()` and `console.log`s interim/final. This gets replaced by the real UI in step 4-8 within the same change; the console logs stay behind a `DEV` flag.

### 4. EMR integration — trigger + active-section ring

- F2 anywhere in `/demo` toggles dictation targeted at the current `activeSoapSection`. Switching SOAP tabs mid-session updates the target ref so subsequent finals commit to the new section.
- Small mic button in the New Note header (right of the note-type `<select>`): idle = outline mic, connecting = spinner-ish pulse, listening = filled mic in `#0D57FA`, error = mic-off in muted red. `aria-pressed`, tooltip.
- Update textarea placeholder to `"Press F2 or click the mic to dictate."`.
- Active textarea while `status==="listening"`: `ring-2 ring-[#0D57FA] ring-inset`. No other visual changes to the EMR.

### 5. Listening strip (floating pill)

New component `src/components/demo/DictationStrip.tsx`, mounted inside the note editor card, absolutely positioned bottom-center with `pointer-events-auto`. Matches landing `FloatingDictation` aesthetic (white, radius 12, border `#C9D6EC`, card shadow, Inter).

Contents left→right:
- MayScribe gradient mark + wordmark (small).
- Green "Listening" pill (or "Connecting" with pulse when `status==="connecting"`).
- Live waveform: 20 bars, each height = `f(audioLevel, i)` with a small per-bar phase offset so it feels alive but is entirely driven by real `audioLevel` (no synthetic loop). Height range 4–28px, `transition: height 80ms linear`.
- Elapsed timer `mm:ss` from `start()`.
- Interim line: single-line muted italic (`text-[#7A8AAC]`) text of the current interim transcript; CSS `direction: rtl; text-align: left; unicode-bidi: plaintext` trick or `text-overflow: ellipsis` with a right-anchored inline flex so the newest words remain visible (truncate from the left). Cleared on final.
- Stop button (X) → calls `stop()`.

Mount/unmount: Framer-less CSS — `opacity` + `translateY(4px)` transition 150ms. Interim text NEVER touches the textarea.

### 6. Commit behavior

- Track `caretRef` per section: on textarea `onSelect`/`onKeyUp`/`onClick`/`onBlur`, store `selectionStart`.
- On `onFinal(text)`: read current value of the active section, splice `text` at `caretRef` (prepend a single space if inserting after a non-space and existing text is non-empty), update state, advance caret by inserted length. After React commits, restore selection on the textarea and set `scrollTop` to keep the caret in view.
- Section switches during a session update the target ref before the next final arrives — in-flight interims are dropped when the tab changes.

### 7. Commit micro-feedback

- Maintain a small `flashRanges` array `[{ section, start, end, until }]`. Render the textarea unchanged, but overlay a positioned absolutely-hidden `<pre>` mirror only for the flash: simpler alternative — briefly toggle a wrapper class that sets `background: linear-gradient(...)` on the textarea for 600ms, keyed off `lastCommittedAt`. Given textarea can't highlight ranges natively, use a subtle 600ms `background-color: #EEF4FC → transparent` transition on the textarea itself scoped to the last commit; acceptable trade-off vs. building a full mirror. If you want true range highlighting I'll swap to a contenteditable+mirror approach — flag in feedback.
- Draft badge timestamp updates to current `HH:MM` on each commit.

### 8. Errors & permissions

- Mic permission denied (`NotAllowedError`): inline notice in the New Note header row: red-tinted `"Microphone blocked — enable it in the browser bar"` with an info icon. No toast.
- Token fetch fail / socket error: same inline slot shows `"Dictation unavailable — retry"` with a retry button.
- Expired mid-session: strip shows `"Session expired — press F2 to resume"` for 4s then unmounts.

### Files touched

- Add: `src/routes/api/deepgram-token.ts`, `src/components/demo/useDictation.ts`, `src/components/demo/DictationStrip.tsx`.
- Edit: `src/components/demo/EmrDashboard.tsx` — additive only (mic button, F2 listener, active ring, textarea placeholder, caret tracking, strip mount, header error slot).
- Secret: `DEEPGRAM_API_KEY` via `add_secret`.

### Open question (answer before I build)

1. Confirm TanStack server route for the token endpoint is fine, or hold to Supabase edge function.
2. For commit flash: accept the whole-textarea 600ms tint, or should I build the mirror overlay for true per-range `#EEF4FC` highlighting?
