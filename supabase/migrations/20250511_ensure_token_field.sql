
-- This migration ensures the token field exists in the email_verification_codes table
-- It will be applied automatically when the Supabase project updates

-- Add the token field if it doesn't exist
ALTER TABLE IF EXISTS public.email_verification_codes 
ADD COLUMN IF NOT EXISTS token TEXT;

-- Create an index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_token
ON public.email_verification_codes(token);

-- Add is_activated field to user_profiles if it doesn't exist
ALTER TABLE IF EXISTS public.user_profiles
ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT false;

-- Add email field to user_security if it doesn't exist 
ALTER TABLE IF EXISTS public.user_security
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create an index for faster email lookups in user_security
CREATE INDEX IF NOT EXISTS idx_user_security_email
ON public.user_security(email);

-- Update RLS policies to ensure proper access
-- Ensure anyone can select verification codes
CREATE POLICY IF NOT EXISTS "Anyone can select email verification codes"
ON public.email_verification_codes
FOR SELECT
USING (true);

-- Ensure anyone can update verification codes (for marking as used)
CREATE POLICY IF NOT EXISTS "Anyone can update email verification codes"
ON public.email_verification_codes
FOR UPDATE
USING (true)
WITH CHECK (true);
