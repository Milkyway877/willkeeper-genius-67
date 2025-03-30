
-- Check if stripe_customer_id column exists in user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    -- Add stripe_customer_id column to user_profiles table
    ALTER TABLE public.user_profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
END
$$;
