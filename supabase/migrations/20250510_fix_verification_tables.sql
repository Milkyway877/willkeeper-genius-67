
-- Drop the email_verification_codes table if it exists
DROP TABLE IF EXISTS public.email_verification_codes;

-- Make sure verification_codes table exists
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL, -- 'signup', 'login', 'recovery'
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS verification_codes_email_idx ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS verification_codes_code_idx ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS verification_codes_type_idx ON public.verification_codes(type);
CREATE INDEX IF NOT EXISTS verification_codes_expires_at_idx ON public.verification_codes(expires_at);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role has full access to verification codes" 
  ON public.verification_codes 
  FOR ALL 
  TO service_role
  USING (true);
