
-- Create email_verification_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  user_id UUID
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS email_verification_codes_email_idx ON public.email_verification_codes (email);
CREATE INDEX IF NOT EXISTS email_verification_codes_code_idx ON public.email_verification_codes (code);
CREATE INDEX IF NOT EXISTS email_verification_codes_type_idx ON public.email_verification_codes (type);
CREATE INDEX IF NOT EXISTS email_verification_codes_used_idx ON public.email_verification_codes (used);
CREATE INDEX IF NOT EXISTS email_verification_codes_expires_at_idx ON public.email_verification_codes (expires_at);

-- Add RLS policies
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can verify codes
CREATE POLICY IF NOT EXISTS "Anyone can verify codes" 
  ON public.email_verification_codes 
  FOR SELECT 
  USING (true);

-- Anyone can insert verification codes (needed for signups)
CREATE POLICY IF NOT EXISTS "Anyone can insert verification codes" 
  ON public.email_verification_codes 
  FOR INSERT 
  WITH CHECK (true);

-- Anyone can update verification codes
CREATE POLICY IF NOT EXISTS "Anyone can update verification codes" 
  ON public.email_verification_codes 
  FOR UPDATE 
  USING (true);
