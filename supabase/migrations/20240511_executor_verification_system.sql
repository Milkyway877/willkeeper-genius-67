
-- Create tables for executor verification system

-- Table for storing verification sessions
CREATE TABLE IF NOT EXISTS public.executor_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  executor_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated', -- initiated, in_progress, completed, expired
  pins_required INTEGER NOT NULL,
  pins_received INTEGER NOT NULL DEFAULT 0,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for storing PINs for each trusted contact
CREATE TABLE IF NOT EXISTS public.executor_access_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES public.executor_verifications(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL,
  pin TEXT NOT NULL,
  pin_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, used
  sent_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(verification_id, contact_id)
);

-- Table for tracking document access
CREATE TABLE IF NOT EXISTS public.executor_document_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES public.executor_verifications(id) ON DELETE CASCADE,
  executor_id UUID NOT NULL,
  document_id UUID NOT NULL,
  access_type TEXT NOT NULL, -- view, download
  access_count INTEGER NOT NULL DEFAULT 0,
  first_accessed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_executor_verifications_user_id ON public.executor_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_executor_access_pins_verification_id ON public.executor_access_pins(verification_id);
CREATE INDEX IF NOT EXISTS idx_executor_document_access_verification_id ON public.executor_document_access(verification_id);

-- RLS Policies
ALTER TABLE public.executor_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executor_access_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executor_document_access ENABLE ROW LEVEL SECURITY;

-- Function to check if a user is the executor for a verification
CREATE OR REPLACE FUNCTION public.is_executor_for_verification(verification_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  executor_email TEXT;
  current_user_email TEXT;
BEGIN
  -- Get executor email for this verification
  SELECT e.email INTO executor_email
  FROM executor_verifications v
  JOIN will_executors e ON v.executor_id = e.id
  WHERE v.id = verification_id;
  
  -- Get current user's email
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if emails match
  RETURN executor_email = current_user_email;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for executor_verifications
CREATE POLICY "Edge functions can access all verification data"
  ON public.executor_verifications
  USING (true);

-- RLS Policies for executor_access_pins
CREATE POLICY "Edge functions can access all PIN data"
  ON public.executor_access_pins
  USING (true);

-- RLS Policies for executor_document_access
CREATE POLICY "Edge functions can access all document access data"
  ON public.executor_document_access
  USING (true);

-- Function to check verification session and update PIN status
CREATE OR REPLACE FUNCTION check_executor_verification(verification_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_record JSONB;
  user_name TEXT;
  executor_name TEXT;
  result JSONB;
BEGIN
  -- Get verification record
  SELECT json_build_object(
    'id', v.id,
    'user_id', v.user_id,
    'executor_id', v.executor_id,
    'status', v.status,
    'pins_required', v.pins_required,
    'pins_received', v.pins_received,
    'expires_at', v.expires_at,
    'created_at', v.created_at
  ) INTO v_record
  FROM executor_verifications v
  WHERE v.id = verification_id;
  
  -- Get user and executor names
  SELECT 
    COALESCE(u.full_name, CONCAT(u.first_name, ' ', u.last_name)) INTO user_name
  FROM user_profiles u
  WHERE u.id = (v_record->>'user_id')::UUID;
  
  SELECT e.name INTO executor_name
  FROM will_executors e
  WHERE e.id = (v_record->>'executor_id')::UUID;
  
  -- Build final result
  result := json_build_object(
    'verification_id', verification_id,
    'status', v_record->>'status',
    'pins_required', (v_record->>'pins_required')::INT,
    'pins_received', (v_record->>'pins_received')::INT,
    'expires_at', v_record->>'expires_at',
    'user_name', user_name,
    'executor_name', executor_name
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
