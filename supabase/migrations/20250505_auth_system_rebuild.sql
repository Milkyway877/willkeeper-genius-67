
-- Drop existing tables if necessary (we're doing a complete rebuild)
DROP TABLE IF EXISTS public.email_verification_codes CASCADE;

-- Create a more structured verification_codes table
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL, -- 'signup', 'login', 'recovery'
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0
);

-- Add indexes for better query performance
CREATE INDEX verification_codes_email_idx ON public.verification_codes(email);
CREATE INDEX verification_codes_code_idx ON public.verification_codes(code);
CREATE INDEX verification_codes_type_idx ON public.verification_codes(type);
CREATE INDEX verification_codes_expires_at_idx ON public.verification_codes(expires_at);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can select (for verification)
CREATE POLICY "Anyone can verify codes" 
  ON public.verification_codes 
  FOR SELECT 
  USING (true);

-- Anyone can insert (for signup/login flows)
CREATE POLICY "Anyone can insert verification codes" 
  ON public.verification_codes 
  FOR INSERT 
  WITH CHECK (true);

-- Anyone can update their own codes
CREATE POLICY "Anyone can update verification codes" 
  ON public.verification_codes 
  FOR UPDATE 
  USING (true);

-- Create a clean user_security table
CREATE TABLE IF NOT EXISTS public.user_security (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  last_verified TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMPTZ,
  known_devices JSONB[] DEFAULT ARRAY[]::JSONB[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

-- Users can see their own security settings
CREATE POLICY "Users can view their own security settings" 
  ON public.user_security 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Service role can manage all security settings
CREATE POLICY "Service role has full access" 
  ON public.user_security 
  FOR ALL 
  TO service_role
  USING (true);

-- Create/keep the verification_logs table for audit
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS verification_logs_email_idx ON public.verification_logs(email);
CREATE INDEX IF NOT EXISTS verification_logs_type_idx ON public.verification_logs(type);
CREATE INDEX IF NOT EXISTS verification_logs_created_at_idx ON public.verification_logs(created_at);

-- Enable RLS
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Service role can insert logs
CREATE POLICY "Service role can insert logs" 
  ON public.verification_logs 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);
  
-- Users can view their own logs
CREATE POLICY "Users can view their own logs" 
  ON public.verification_logs 
  FOR SELECT 
  TO authenticated
  USING (email = auth.email());
  
-- Service role has full access
CREATE POLICY "Service role has full access to logs" 
  ON public.verification_logs 
  FOR ALL 
  TO service_role
  USING (true);
