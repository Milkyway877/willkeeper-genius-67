
-- Fix death verification settings table schema
-- This migration ensures all required columns exist with proper constraints

-- First, ensure the table exists with all required columns
CREATE TABLE IF NOT EXISTS public.death_verification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in_enabled BOOLEAN DEFAULT false NOT NULL,
    check_in_frequency INTEGER DEFAULT 30 NOT NULL,
    grace_period INTEGER DEFAULT 7 NOT NULL,
    beneficiary_verification_interval INTEGER DEFAULT 48 NOT NULL,
    reminder_frequency INTEGER DEFAULT 24 NOT NULL,
    pin_system_enabled BOOLEAN DEFAULT true NOT NULL,
    executor_override_enabled BOOLEAN DEFAULT true NOT NULL,
    trusted_contact_enabled BOOLEAN DEFAULT true NOT NULL,
    trusted_contact_email TEXT,
    failsafe_enabled BOOLEAN DEFAULT true NOT NULL,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add grace_period column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'grace_period'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN grace_period INTEGER DEFAULT 7 NOT NULL;
        RAISE NOTICE 'Added grace_period column';
    END IF;

    -- Add trusted_contact_email column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'trusted_contact_email'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN trusted_contact_email TEXT;
        RAISE NOTICE 'Added trusted_contact_email column';
    END IF;

    -- Add notification_preferences column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb NOT NULL;
        RAISE NOTICE 'Added notification_preferences column';
    END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Grace period constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'death_verification_settings_grace_period_check'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD CONSTRAINT death_verification_settings_grace_period_check 
        CHECK (grace_period >= 1 AND grace_period <= 30);
        RAISE NOTICE 'Added grace_period check constraint';
    END IF;

    -- Check-in frequency constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'death_verification_settings_check_in_frequency_check'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD CONSTRAINT death_verification_settings_check_in_frequency_check 
        CHECK (check_in_frequency >= 1 AND check_in_frequency <= 365);
        RAISE NOTICE 'Added check_in_frequency check constraint';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.death_verification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Policy for users to select their own settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'death_verification_settings' 
        AND policyname = 'Users can view own death verification settings'
    ) THEN
        CREATE POLICY "Users can view own death verification settings" 
        ON public.death_verification_settings 
        FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Created SELECT policy';
    END IF;

    -- Policy for users to insert their own settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'death_verification_settings' 
        AND policyname = 'Users can insert own death verification settings'
    ) THEN
        CREATE POLICY "Users can insert own death verification settings" 
        ON public.death_verification_settings 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created INSERT policy';
    END IF;

    -- Policy for users to update their own settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'death_verification_settings' 
        AND policyname = 'Users can update own death verification settings'
    ) THEN
        CREATE POLICY "Users can update own death verification settings" 
        ON public.death_verification_settings 
        FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created UPDATE policy';
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE public.death_verification_settings IS 'User settings for death verification check-in system';
COMMENT ON COLUMN public.death_verification_settings.grace_period IS 'Number of days after missed check-in before triggering death verification process';
COMMENT ON COLUMN public.death_verification_settings.check_in_frequency IS 'How often user needs to check in (in days)';
COMMENT ON COLUMN public.death_verification_settings.trusted_contact_email IS 'Email of trusted contact who can override PIN system';
COMMENT ON COLUMN public.death_verification_settings.notification_preferences IS 'JSON object containing email and push notification preferences';

RAISE NOTICE 'Death verification settings table schema updated successfully';
