## Fix: lock down `verify_demo_passcode` SECURITY DEFINER

Both findings point to the same function (`public.verify_demo_passcode`), currently `EXECUTE`-able by `anon` and `authenticated`. The function must stay `SECURITY DEFINER` (it reads `demo_passcodes`, which has no client policies), so the fix is to (a) call it only from trusted server code and (b) revoke public execute.

### 1. Server function — use service-role client for the RPC
In `src/lib/demo-gate.functions.ts`, replace `getSupabase()` (publishable key) with a dynamic import of `supabaseAdmin` from `@/integrations/supabase/client.server` inside the `unlockDemo` handler. All other logic (session cookie, zod validation, generic `{ ok: false }` response) stays the same. This keeps the passcode check server-only and unreachable from the browser.

### 2. Migration — revoke public execute
```sql
REVOKE ALL ON FUNCTION public.verify_demo_passcode(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_demo_passcode(text) TO service_role;
```

### 3. Verify & clear findings
- Test `/demo/unlock` with `ForDadRoseland` → should still unlock.
- Test with a wrong passcode → still returns generic failure.
- Mark both Supabase findings as fixed with an explanation.

No user-visible change; the demo gate keeps working, and the function is no longer part of the exposed API surface.