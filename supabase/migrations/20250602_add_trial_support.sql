
-- Add trial support columns to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;

-- Update the subscribers table if it exists to include trial fields
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscribers') THEN
        ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;
        ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;
        ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
