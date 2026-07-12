REVOKE ALL ON FUNCTION public.verify_demo_passcode(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_demo_passcode(text) FROM anon;
REVOKE ALL ON FUNCTION public.verify_demo_passcode(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.verify_demo_passcode(text) TO service_role;