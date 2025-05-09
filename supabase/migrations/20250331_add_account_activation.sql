
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

-- Also make sure activation_complete column exists, and add an update trigger to sync is_activated and activation_complete
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS activation_complete BOOLEAN DEFAULT false;

-- Create a trigger to keep is_activated and activation_complete in sync
CREATE OR REPLACE FUNCTION public.sync_activation_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_activated != OLD.is_activated THEN
      NEW.activation_complete = NEW.is_activated;
    ELSIF NEW.activation_complete != OLD.activation_complete THEN
      NEW.is_activated = NEW.activation_complete;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_activation_fields ON public.user_profiles;

CREATE TRIGGER sync_activation_fields
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_activation_fields();
