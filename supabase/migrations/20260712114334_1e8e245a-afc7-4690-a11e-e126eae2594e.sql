
CREATE TABLE public.demo_passcodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL DEFAULT 'Untitled',
  passcode_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.demo_passcodes TO service_role;

ALTER TABLE public.demo_passcodes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_demo_passcodes_updated_at
  BEFORE UPDATE ON public.demo_passcodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.verify_demo_passcode(input TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.demo_passcodes
    WHERE is_active
      AND (expires_at IS NULL OR expires_at > now())
      AND passcode_hash = extensions.crypt(input, passcode_hash)
  );
$$;

REVOKE ALL ON FUNCTION public.verify_demo_passcode(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_demo_passcode(TEXT) TO anon, authenticated, service_role;

INSERT INTO public.demo_passcodes (label, passcode_hash)
VALUES ('Initial', extensions.crypt('ForDadRoseland', extensions.gen_salt('bf', 10)));
