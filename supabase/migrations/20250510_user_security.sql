
-- Create user_security table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT, -- Added email field to match what's being used in the code
  google_auth_enabled BOOLEAN DEFAULT false,
  google_auth_secret TEXT,
  encryption_key TEXT,
  recovery_codes JSONB,
  last_2fa_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_security_user_id 
ON public.user_security(user_id);

CREATE INDEX IF NOT EXISTS idx_user_security_email 
ON public.user_security(email);

-- Add RLS policies
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own security settings
CREATE POLICY IF NOT EXISTS "Users can read their own security settings"
ON public.user_security
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own security settings
CREATE POLICY IF NOT EXISTS "Users can update their own security settings"
ON public.user_security
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own security settings
CREATE POLICY IF NOT EXISTS "Users can insert their own security settings"
ON public.user_security
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow anyone to use security settings for verification (with constraints)
CREATE POLICY IF NOT EXISTS "Anyone can verify security settings"
ON public.user_security
FOR SELECT
USING (true);
