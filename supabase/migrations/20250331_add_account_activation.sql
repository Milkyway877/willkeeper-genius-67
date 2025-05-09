
-- Add account activation fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN is_activated BOOLEAN DEFAULT false,
ADD COLUMN subscription_plan TEXT DEFAULT 'free',
ADD COLUMN activation_date TIMESTAMP WITH TIME ZONE;

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

CREATE TRIGGER set_activation_date
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_activation_date();
