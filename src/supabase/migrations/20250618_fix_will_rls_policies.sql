
-- Fix RLS policies for wills table to allow proper create/update operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can create their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can update their own wills" ON public.wills;
DROP POLICY IF EXISTS "Users can delete their own wills" ON public.wills;

-- Enable RLS
ALTER TABLE public.wills ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for wills table
CREATE POLICY "Users can view their own wills"
  ON public.wills
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wills"
  ON public.wills
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wills"
  ON public.wills
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wills"
  ON public.wills
  FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure the wills table has all required columns
ALTER TABLE public.wills 
ADD COLUMN IF NOT EXISTS subscription_required_after TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'custom';
