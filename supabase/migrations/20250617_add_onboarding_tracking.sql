
-- Add onboarding tracking column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add trigger to track when onboarding is completed
CREATE OR REPLACE FUNCTION public.update_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarding_completed = true AND OLD.onboarding_completed = false THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_onboarding_completion ON public.user_profiles;
CREATE TRIGGER set_onboarding_completion
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_onboarding_completion();

-- Enable RLS for the onboarding_completed column
CREATE POLICY "Users can view their own onboarding status" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own onboarding status" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);
