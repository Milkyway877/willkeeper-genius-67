
-- Create verification_logs table if it doesn't exist
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

-- Allow only service role to insert logs
CREATE POLICY IF NOT EXISTS "Service role can insert logs" 
  ON public.verification_logs 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);
  
-- Allow authenticated users to view their own logs
CREATE POLICY IF NOT EXISTS "Users can view their own logs" 
  ON public.verification_logs 
  FOR SELECT 
  TO authenticated
  USING (email = auth.email());
  
-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role has full access to logs" 
  ON public.verification_logs 
  FOR ALL 
  TO service_role
  USING (true);

-- Create verification_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS verification_codes_email_idx ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS verification_codes_code_idx ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS verification_codes_type_idx ON public.verification_codes(type);
CREATE INDEX IF NOT EXISTS verification_codes_used_idx ON public.verification_codes(used);
CREATE INDEX IF NOT EXISTS verification_codes_expires_at_idx ON public.verification_codes(expires_at);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role has full access to verification codes" 
  ON public.verification_codes 
  FOR ALL 
  TO service_role
  USING (true);

-- Create user_security table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  last_verified TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_attempt TIMESTAMPTZ,
  account_locked BOOLEAN DEFAULT false,
  lock_until TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  known_devices JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS user_security_user_id_idx ON public.user_security(user_id);
CREATE INDEX IF NOT EXISTS user_security_email_idx ON public.user_security(email);

-- Enable RLS
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to see their own security settings
CREATE POLICY IF NOT EXISTS "Users can view their own security settings" 
  ON public.user_security 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role has full access to user_security" 
  ON public.user_security 
  FOR ALL 
  TO service_role
  USING (true);
