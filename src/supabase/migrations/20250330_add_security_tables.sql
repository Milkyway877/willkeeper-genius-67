
-- Create user_security table
CREATE TABLE IF NOT EXISTS public.user_security (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encryption_key TEXT,
  google_auth_enabled BOOLEAN DEFAULT FALSE,
  google_auth_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for user_security
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own security settings"
  ON public.user_security
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
  ON public.user_security
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
  ON public.user_security
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create recovery_codes table
CREATE TABLE IF NOT EXISTS public.recovery_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  UNIQUE(user_id, code)
);

-- Add RLS policies for recovery_codes
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recovery codes"
  ON public.recovery_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recovery codes"
  ON public.recovery_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recovery codes"
  ON public.recovery_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create encryption_keys table
CREATE TABLE IF NOT EXISTS public.encryption_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  strength TEXT NOT NULL,
  key_material TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

-- Add RLS policies for encryption_keys
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own encryption keys"
  ON public.encryption_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own encryption keys"
  ON public.encryption_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own encryption keys"
  ON public.encryption_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own encryption keys"
  ON public.encryption_keys
  FOR DELETE
  USING (auth.uid() = user_id);
