# Why mayscribe.com isn't showing the dictation changes

You said you republished after the dictation work but mayscribe.com still looks old on `/demo`. Custom domains serve the latest published build, so if the changes aren't there, one of four things is happening. Here's how to isolate it, in order.

## 1. Compare the two published URLs first

Open both in a fresh incognito window and go straight to `/demo`:

- `https://scribe-clarity-landing.lovable.app/demo`
- `https://mayscribe.com/demo`

- If the Lovable URL has the mic button + F2 strip and mayscribe.com doesn't → **it's a custom-domain/CDN cache**, not a build issue. See step 3.
- If neither has it → **the publish didn't actually include the dictation commit**. See step 2.
- If both have it → your browser is caching. Hard-reload (Cmd/Ctrl+Shift+R) or clear site data.

## 2. If neither published URL shows it

The most likely cause: Publish was clicked before the dictation edits were committed in this session, so the deploy shipped the previous build. Fix:

- Open the Publish dialog and click **Update** again. Watch for the "Publishing…" state to complete (~1 minute).
- Recheck `scribe-clarity-landing.lovable.app/demo` in incognito.

I'll also verify from my side that the publish record is current and that publish visibility is `public` (a `private` visibility would show an auth screen instead of stale content, but worth ruling out).

## 3. If only mayscribe.com is stale

Custom domains sit behind a CDN edge. After a republish, propagation to every edge POP can lag a few minutes; a proxy in front of the domain (Cloudflare orange-cloud) can hold it much longer.

- Wait 2–5 minutes, then hard-reload mayscribe.com/demo in incognito.
- Try from a different network (phone on cellular) to bypass any local/ISP caching.
- If you have Cloudflare or another proxy in front of mayscribe.com, purge its cache for `/demo` (or the whole zone).

## 4. Preview 502 on `/api/deepgram-token` (separate issue)

Your console screenshot shows the preview returning 502 from the token endpoint. That is only about the preview environment right now, not about why the published UI looks old — but it means dictation won't actually run in preview until we fix it. Most likely cause: `DEEPGRAM_API_KEY` isn't set in the preview environment or the upstream `POST /v1/auth/grant` call failed. I'll address this in a follow-up once the publish question above is sorted, unless you want me to fold it into the same fix.

## What I'll do next

After you tell me which of steps 1–3 matched (or after we look at the two URLs together), I'll either:
- point you at the right cache purge, or
- push a fresh publish and confirm the `/demo` bundle contains `DictationStrip` and the mic button.

No code changes are needed to answer this; the fix is a publish/cache action on your side. I'll only touch code if step 4 (the 502) turns out to need it.
