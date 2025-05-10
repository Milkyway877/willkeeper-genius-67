
-- Create trusted_contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relation TEXT,
  invitation_status TEXT DEFAULT 'pending',
  invitation_sent_at TIMESTAMPTZ,
  invitation_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Create contact_verifications table for storing verification tokens
CREATE TABLE IF NOT EXISTS public.contact_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL,
  contact_type TEXT NOT NULL, -- 'trusted', 'beneficiary', or 'executor'
  verification_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create death_verification_settings table for user preferences
CREATE TABLE IF NOT EXISTS public.death_verification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_enabled BOOLEAN DEFAULT false,
  check_in_frequency INTEGER DEFAULT 30, -- days
  grace_period INTEGER DEFAULT 7, -- days
  beneficiary_verification_interval INTEGER DEFAULT 48, -- hours
  reminder_frequency INTEGER DEFAULT 24, -- hours
  pin_system_enabled BOOLEAN DEFAULT true,
  executor_override_enabled BOOLEAN DEFAULT true,
  trusted_contact_enabled BOOLEAN DEFAULT true,
  failsafe_enabled BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create death_verification_checkins table to track user check-ins
CREATE TABLE IF NOT EXISTS public.death_verification_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_check_in TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create death_verification_requests table for verification process
CREATE TABLE IF NOT EXISTS public.death_verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'initiated',
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  verification_result TEXT,
  verification_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create death_verification_pins table for will access PINs
CREATE TABLE IF NOT EXISTS public.death_verification_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  recovery_code TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create death_verification_logs for system activity tracking
CREATE TABLE IF NOT EXISTS public.death_verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Set up Row Level Security for all tables
-- trusted_contacts table
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trusted contacts"
  ON public.trusted_contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted contacts"
  ON public.trusted_contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted contacts"
  ON public.trusted_contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted contacts"
  ON public.trusted_contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- contact_verifications table
ALTER TABLE public.contact_verifications ENABLE ROW LEVEL SECURITY;

-- Update policies for contact_verifications table to allow user inserts
CREATE POLICY "Users can view their own contact verifications"
  ON public.contact_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact verifications"
  ON public.contact_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- death_verification_settings table
ALTER TABLE public.death_verification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own death verification settings"
  ON public.death_verification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own death verification settings"
  ON public.death_verification_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own death verification settings"
  ON public.death_verification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- death_verification_checkins table
ALTER TABLE public.death_verification_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own death verification checkins"
  ON public.death_verification_checkins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own death verification checkins"
  ON public.death_verification_checkins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- death_verification_requests table
ALTER TABLE public.death_verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own death verification requests"
  ON public.death_verification_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Other tables with similar RLS policies
ALTER TABLE public.death_verification_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.death_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own death verification pins"
  ON public.death_verification_pins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own death verification logs"
  ON public.death_verification_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS trusted_contacts_user_id_idx ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS contact_verifications_user_id_idx ON public.contact_verifications(user_id);
CREATE INDEX IF NOT EXISTS death_verification_checkins_user_id_idx ON public.death_verification_checkins(user_id);
CREATE INDEX IF NOT EXISTS death_verification_requests_user_id_idx ON public.death_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS verification_token_idx ON public.contact_verifications(verification_token);

-- Ensure the notifications table exists for system notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add will_beneficiaries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.will_beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficiary_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relation TEXT,
  allocation_percentage NUMERIC,
  specific_assets TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.will_beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own beneficiaries"
  ON public.will_beneficiaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own beneficiaries"
  ON public.will_beneficiaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beneficiaries"
  ON public.will_beneficiaries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beneficiaries"
  ON public.will_beneficiaries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add will_executors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.will_executors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relation TEXT,
  primary_executor BOOLEAN DEFAULT false,
  compensation TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.will_executors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own executors"
  ON public.will_executors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own executors"
  ON public.will_executors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own executors"
  ON public.will_executors
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own executors"
  ON public.will_executors
  FOR DELETE
  USING (auth.uid() = user_id);
