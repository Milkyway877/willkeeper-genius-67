
-- Ensure we have the email field in user_security table
ALTER TABLE IF EXISTS public.user_security
ADD COLUMN IF NOT EXISTS email TEXT;

-- Make sure token field exists in email_verification_codes
ALTER TABLE IF EXISTS public.email_verification_codes
ADD COLUMN IF NOT EXISTS token TEXT;

-- Create index for faster lookups by token
CREATE INDEX IF NOT EXISTS idx_verification_codes_token
ON public.email_verification_codes(token);

-- Create index for faster lookups by email in user_security
CREATE INDEX IF NOT EXISTS idx_user_security_email
ON public.user_security(email);

-- Create a function to validate verification tokens
DROP FUNCTION IF EXISTS is_verification_token_valid;
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

-- Ensure RLS policies allow proper access
DROP POLICY IF EXISTS "Anyone can verify codes" ON public.email_verification_codes;
CREATE POLICY "Anyone can verify codes" 
  ON public.email_verification_codes 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can update verification codes" ON public.email_verification_codes;
CREATE POLICY "Anyone can update verification codes" 
  ON public.email_verification_codes 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);
