
-- Create user_security table for tracking security-related information
CREATE TABLE IF NOT EXISTS public.user_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_verified TIMESTAMPTZ,
  known_devices JSONB DEFAULT '[]'::jsonb,
  verification_required BOOLEAN DEFAULT true,
  failed_login_attempts INT DEFAULT 0,
  last_failed_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

-- Users can read their own security information
CREATE POLICY IF NOT EXISTS "Users can read their own security information" 
  ON public.user_security 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own security information
CREATE POLICY IF NOT EXISTS "Users can update their own security information" 
  ON public.user_security 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Only authenticated users can insert security information
CREATE POLICY IF NOT EXISTS "Users can insert their own security information" 
  ON public.user_security 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to update the 'updated_at' column on every update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the 'updated_at' column
DROP TRIGGER IF EXISTS update_user_security_updated_at ON public.user_security;
CREATE TRIGGER update_user_security_updated_at
BEFORE UPDATE ON public.user_security
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
