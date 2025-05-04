
-- Add is_activated and email_verified columns if they don't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create login_sessions table to track user sessions with expiration
CREATE TABLE IF NOT EXISTS public.login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS email_verification_codes_email_idx ON public.email_verification_codes (email);
CREATE INDEX IF NOT EXISTS email_verification_codes_expires_idx ON public.email_verification_codes (expires_at);
CREATE INDEX IF NOT EXISTS login_sessions_user_id_idx ON public.login_sessions (user_id);
CREATE INDEX IF NOT EXISTS login_sessions_expires_idx ON public.login_sessions (expires_at);

-- Add RLS policies for login sessions
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY IF NOT EXISTS "Users can see own sessions" 
  ON public.login_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only update their own sessions
CREATE POLICY IF NOT EXISTS "Users can update own sessions" 
  ON public.login_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY IF NOT EXISTS "Users can delete own sessions" 
  ON public.login_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY IF NOT EXISTS "Users can insert sessions" 
  ON public.login_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
