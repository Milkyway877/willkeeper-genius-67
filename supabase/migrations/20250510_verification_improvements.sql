
-- Add a function to get current server timestamp
CREATE OR REPLACE FUNCTION get_current_timestamp()
RETURNS timestamptz
LANGUAGE sql STABLE
AS $$
  SELECT NOW();
$$;

-- Improve the is_verification_code_valid function to handle edge cases better
CREATE OR REPLACE FUNCTION is_verification_code_valid(check_email TEXT, check_code TEXT, check_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.email_verification_codes
    WHERE email = check_email
    AND code = check_code
    AND type = check_type
    AND used = false
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Ensure RLS policies are set correctly
DROP POLICY IF EXISTS "Anyone can verify codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON public.email_verification_codes;

-- Create policies with proper permissions
-- Allow anyone to SELECT verification codes (needed for verification)
CREATE POLICY "Anyone can verify codes" 
  ON public.email_verification_codes 
  FOR SELECT 
  USING (true);

-- Allow anyone to UPDATE verification codes (for marking as used)
CREATE POLICY "Anyone can update verification codes" 
  ON public.email_verification_codes 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Ensure email_verified field exists in user_profiles
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_code_type_used
ON public.email_verification_codes(email, code, type, used)
WHERE used = false;

-- Fix expires_at indexing for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at
ON public.email_verification_codes(expires_at)
WHERE expires_at > NOW();
