
-- Create function to get death verification settings by user_id
CREATE OR REPLACE FUNCTION public.get_death_verification_settings(user_id_param UUID)
RETURNS SETOF public.death_verification_settings
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.death_verification_settings 
  WHERE user_id = user_id_param
$$;

-- Create function to get latest check-in for a user
CREATE OR REPLACE FUNCTION public.get_latest_checkin(user_id_param UUID)
RETURNS SETOF public.death_verification_checkins
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.death_verification_checkins
  WHERE user_id = user_id_param
  ORDER BY checked_in_at DESC
  LIMIT 1
$$;

-- Create function to check if user needs to check in
CREATE OR REPLACE FUNCTION public.check_if_checkin_needed(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings RECORD;
  latest_checkin RECORD;
BEGIN
  -- Get user settings
  SELECT * INTO settings FROM public.death_verification_settings 
  WHERE user_id = user_id_param
  LIMIT 1;
  
  -- If settings don't exist or check-in is disabled, return false
  IF NOT FOUND OR NOT settings.check_in_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Get latest check-in
  SELECT * INTO latest_checkin FROM public.death_verification_checkins
  WHERE user_id = user_id_param
  ORDER BY checked_in_at DESC
  LIMIT 1;
  
  -- If no check-in exists, return true (need to check in)
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Check if next_check_in date has passed
  RETURN latest_checkin.next_check_in <= NOW();
END;
$$;
