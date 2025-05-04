
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
  USING (email = current_user);
  
-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role has full access to logs" 
  ON public.verification_logs 
  FOR ALL 
  TO service_role
  USING (true);
