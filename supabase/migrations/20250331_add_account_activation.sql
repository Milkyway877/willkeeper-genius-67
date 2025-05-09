
-- Add account activation fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS activation_date TIMESTAMP WITH TIME ZONE;

-- Add a trigger to update activation_date when is_activated changes to true
CREATE OR REPLACE FUNCTION public.update_activation_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_activated = true AND OLD.is_activated = false THEN
    NEW.activation_date = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_activation_date ON public.user_profiles;

CREATE TRIGGER set_activation_date
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_activation_date();

-- Remove the activation_complete column if it exists to standardize field naming
DO $$ 
BEGIN
  IF EXISTS(SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user_profiles' 
            AND column_name = 'activation_complete') THEN
    ALTER TABLE public.user_profiles DROP COLUMN activation_complete;
  END IF;
END $$;
