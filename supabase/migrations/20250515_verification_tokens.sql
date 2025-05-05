
-- Update the email_verification_codes table to support token-based verification
ALTER TABLE IF EXISTS public.email_verification_codes
  ADD COLUMN IF NOT EXISTS verification_token UUID,
  ADD COLUMN IF NOT EXISTS link_clicked BOOLEAN DEFAULT false;

-- Create a new index on the verification_token
CREATE INDEX IF NOT EXISTS email_verification_codes_token_idx ON public.email_verification_codes (verification_token);

-- Add RLS policies to support the new verification flow
CREATE POLICY IF NOT EXISTS "Anyone can select by verification token" 
  ON public.email_verification_codes 
  FOR SELECT 
  USING (true);
