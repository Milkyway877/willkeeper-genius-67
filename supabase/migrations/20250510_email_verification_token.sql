
-- Add a token field to the email_verification_codes table if it doesn't exist
ALTER TABLE IF EXISTS public.email_verification_codes
ADD COLUMN IF NOT EXISTS token TEXT;

-- Create an index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_token
ON public.email_verification_codes(token);

-- Create a function to validate verification tokens (similar to code validation)
CREATE OR REPLACE FUNCTION is_verification_token_valid(check_email TEXT, check_token TEXT, check_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.email_verification_codes
    WHERE email = check_email
    AND token = check_token
    AND type = check_type
    AND used = false
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Update the existing RLS policies to ensure they work with token-based verification as well
DROP POLICY IF EXISTS "Anyone can verify codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON public.email_verification_codes;

-- Create policies with proper permissions for both code and token verification
-- Allow anyone to SELECT verification codes/tokens (needed for verification)
CREATE POLICY "Anyone can verify codes" 
  ON public.email_verification_codes 
  FOR SELECT 
  USING (true);

-- Allow anyone to UPDATE verification codes/tokens (for marking as used)
CREATE POLICY "Anyone can update verification codes" 
  ON public.email_verification_codes 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);
