
-- Add email verification fields if they don't exist
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS activation_complete BOOLEAN DEFAULT false;

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

-- Only authenticated users can update their own codes
CREATE POLICY IF NOT EXISTS "Users can update their own verification codes" 
  ON public.email_verification_codes 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);
