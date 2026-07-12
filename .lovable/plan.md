## Goal
Add `/demo` on the main site, gated by a passcode. Passcodes live in a new database table (hashed) so you can add/rotate them over time. First passcode: `ForDadRoseland`. After unlock, land on a blank page.

## Database

New table `public.demo_passcodes`:
- `id uuid pk`
- `label text` — human note ("Roseland demo", etc.)
- `passcode_hash text not null` — bcrypt hash via `pgcrypto`'s `crypt()`
- `is_active boolean not null default true`
- `expires_at timestamptz null`
- `created_at`, `updated_at` timestamps

Security model:
- Enable `pgcrypto`.
- RLS ON. No `anon` or `authenticated` grants for SELECT — nobody can read hashes from the client.
- `GRANT ALL ... TO service_role` only.
- SECURITY DEFINER function `public.verify_demo_passcode(input text) returns boolean` that runs `SELECT 1 FROM demo_passcodes WHERE is_active AND (expires_at IS NULL OR expires_at > now()) AND passcode_hash = crypt(input, passcode_hash)`. `GRANT EXECUTE` to `anon, authenticated` so the server function can call it via the publishable client without leaking the table.
- Seed row: `insert ... crypt('ForDadRoseland', gen_salt('bf'))` with label "Initial".

To add/rotate passcodes later, you'll run a small insert (I can add a simple admin script or you can do it from Cloud SQL).

## Server functions (`src/lib/demo-gate.functions.ts`)

Two secrets:
- `DEMO_SESSION_SECRET` — 32+ char random, minted via `generate_secret` (no user input).

Functions:
- `unlockDemo({ passcode })` — calls `verify_demo_passcode` RPC via a server-side publishable-key Supabase client. On success, `useSession` sets encrypted cookie `demo-gate` (`unlocked: true`, `maxAge: 7 days`, httpOnly, secure, sameSite=lax). Rate-limit-friendly: constant-time DB comparison, generic error on failure.
- `isDemoUnlocked()` — reads session; returns boolean. Used by the `/demo` loader; throws `redirect({ to: "/demo/unlock" })` when false.
- `lockDemo()` — clears session (for later).

## Routes

- `src/routes/demo/unlock.tsx` — public. Centered card matching brand tokens (Inter, `#F8FBFF` bg, `#061338` ink, `#0D57FA` accent). One password field, submit button, generic error on wrong passcode. Calls `unlockDemo` via `useServerFn`; on success, `navigate({ to: "/demo" })`. `head()` sets title + `noindex,nofollow`.
- `src/routes/demo/index.tsx` — loader calls `isDemoUnlocked()` (redirects to `/demo/unlock` if not). Component renders a truly blank page (`<main />` with just a page background). `head()` sets title "MayScribe Demo" and `noindex,nofollow`.

Neither is added to `sitemap.xml`. `robots.txt` gets `Disallow: /demo` and `Disallow: /demo/unlock`.

## What stays unchanged
- No landing-page changes; `/demo` is separate from the marketing site.
- No new UI on the post-auth page yet — intentionally blank so we can drop content in later.

## Ordering
1. Migration (table + grants + RLS + `verify_demo_passcode` + seed row). You approve it.
2. `generate_secret` for `DEMO_SESSION_SECRET`.
3. Server functions + routes + robots update.

## Questions before I build
1. Confirm the seed passcode is exactly `ForDadRoseland` (case-sensitive as written).
2. Should the seed row have an `expires_at`, or leave it null (never expires until you deactivate it)?
