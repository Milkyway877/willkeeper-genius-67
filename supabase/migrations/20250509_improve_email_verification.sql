
-- Update user_profiles table to ensure email_verified field exists
-- This is redundant if the field already exists, but SQLite will just skip it
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add last_login field if it doesn't exist
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Clear out any existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can verify codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Anyone can insert verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Users can update their own verification codes" ON public.email_verification_codes;

-- Create new policies with correct permissions
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

-- Allow anyone to INSERT verification codes (needed for signups)
CREATE POLICY "Anyone can insert verification codes" 
  ON public.email_verification_codes 
  FOR INSERT 
  WITH CHECK (true);

-- Create a function to automatically clean up expired or used verification codes
-- This helps keep the database clean and improves performance
CREATE OR REPLACE FUNCTION clean_old_verification_codes()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.email_verification_codes 
  WHERE 
    (expires_at < NOW() OR used = true) 
    AND created_at < NOW() - INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the cleanup function periodically
DROP TRIGGER IF EXISTS trigger_clean_verification_codes ON public.email_verification_codes;
CREATE TRIGGER trigger_clean_verification_codes
AFTER INSERT ON public.email_verification_codes
EXECUTE FUNCTION clean_old_verification_codes();

-- Create an index to speed up verification queries
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email_code_type
ON public.email_verification_codes (email, code, type);

-- Create a function to check if a verification code is valid
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
