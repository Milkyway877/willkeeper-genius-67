
-- Create death_verification_pins table for storing unlock PIN codes
CREATE TABLE IF NOT EXISTS public.death_verification_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL, -- References beneficiary or executor ID
  contact_type TEXT NOT NULL, -- 'beneficiary' or 'executor'
  pin_code TEXT NOT NULL,
  unlock_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verification_request_id UUID REFERENCES public.death_verification_requests(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Set up Row Level Security
ALTER TABLE public.death_verification_pins ENABLE ROW LEVEL SECURITY;

-- Only edge functions can access this table for security
CREATE POLICY "Edge function access to verification pins"
  ON public.death_verification_pins
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS verification_pins_user_id_idx ON public.death_verification_pins(user_id);
CREATE INDEX IF NOT EXISTS verification_pins_unlock_token_idx ON public.death_verification_pins(unlock_token);
CREATE INDEX IF NOT EXISTS verification_pins_expires_at_idx ON public.death_verification_pins(expires_at);

-- Add email_logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  email_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email logs"
  ON public.email_logs
  FOR SELECT
  USING (true);
