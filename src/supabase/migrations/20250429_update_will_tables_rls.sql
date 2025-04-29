
-- Add RLS policies for will_beneficiaries and will_executors tables

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.will_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.will_executors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can select their own beneficiaries" ON public.will_beneficiaries;
DROP POLICY IF EXISTS "Users can insert their own beneficiaries" ON public.will_beneficiaries;
DROP POLICY IF EXISTS "Users can update their own beneficiaries" ON public.will_beneficiaries;
DROP POLICY IF EXISTS "Users can delete their own beneficiaries" ON public.will_beneficiaries;

DROP POLICY IF EXISTS "Users can select their own executors" ON public.will_executors;
DROP POLICY IF EXISTS "Users can insert their own executors" ON public.will_executors;
DROP POLICY IF EXISTS "Users can update their own executors" ON public.will_executors;
DROP POLICY IF EXISTS "Users can delete their own executors" ON public.will_executors;

-- Create policies for will_beneficiaries
CREATE POLICY "Users can select their own beneficiaries"
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

-- Create policies for will_executors
CREATE POLICY "Users can select their own executors"
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
