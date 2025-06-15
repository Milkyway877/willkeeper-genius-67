
-- Complete fix for death verification system database schema
-- This migration ensures all tables exist with proper structure and constraints

-- First, ensure the original tables exist with all required columns
-- This handles cases where the original migration may not have been fully applied

-- Death verification settings table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Death verification checkins table
CREATE TABLE IF NOT EXISTS public.death_verification_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'alive',
    checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    next_check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Death verification logs table
CREATE TABLE IF NOT EXISTS public.death_verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Death verification requests table
CREATE TABLE IF NOT EXISTS public.death_verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'initiated',
    initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    verification_result TEXT,
    verification_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Death verification pins table
CREATE TABLE IF NOT EXISTS public.death_verification_pins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pin_hash TEXT NOT NULL,
    recovery_code TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Check and add created_at to death_verification_settings if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
        RAISE NOTICE 'Added created_at column to death_verification_settings';
    END IF;

    -- Check and add updated_at to death_verification_settings if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
        RAISE NOTICE 'Added updated_at column to death_verification_settings';
    END IF;

    -- Check and add grace_period if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'grace_period'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN grace_period INTEGER DEFAULT 7 NOT NULL;
        RAISE NOTICE 'Added grace_period column to death_verification_settings';
    END IF;

    -- Check and add trusted_contact_email if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'trusted_contact_email'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN trusted_contact_email TEXT;
        RAISE NOTICE 'Added trusted_contact_email column to death_verification_settings';
    END IF;

    -- Check and add notification_preferences if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb NOT NULL;
        RAISE NOTICE 'Added notification_preferences column to death_verification_settings';
    END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.death_verification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.death_verification_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.death_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.death_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.death_verification_pins ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
DO $$
BEGIN
    -- Death verification settings policies
    DROP POLICY IF EXISTS "Users can view own death verification settings" ON public.death_verification_settings;
    CREATE POLICY "Users can view own death verification settings" 
    ON public.death_verification_settings 
    FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own death verification settings" ON public.death_verification_settings;
    CREATE POLICY "Users can insert own death verification settings" 
    ON public.death_verification_settings 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own death verification settings" ON public.death_verification_settings;
    CREATE POLICY "Users can update own death verification settings" 
    ON public.death_verification_settings 
    FOR UPDATE USING (auth.uid() = user_id);

    -- Death verification checkins policies
    DROP POLICY IF EXISTS "Users can view own death verification checkins" ON public.death_verification_checkins;
    CREATE POLICY "Users can view own death verification checkins" 
    ON public.death_verification_checkins 
    FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own death verification checkins" ON public.death_verification_checkins;
    CREATE POLICY "Users can insert own death verification checkins" 
    ON public.death_verification_checkins 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Death verification logs policies
    DROP POLICY IF EXISTS "Users can view own death verification logs" ON public.death_verification_logs;
    CREATE POLICY "Users can view own death verification logs" 
    ON public.death_verification_logs 
    FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own death verification logs" ON public.death_verification_logs;
    CREATE POLICY "Users can insert own death verification logs" 
    ON public.death_verification_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Death verification requests policies
    DROP POLICY IF EXISTS "Users can view own death verification requests" ON public.death_verification_requests;
    CREATE POLICY "Users can view own death verification requests" 
    ON public.death_verification_requests 
    FOR SELECT USING (auth.uid() = user_id);

    -- Death verification pins policies
    DROP POLICY IF EXISTS "Users can view own death verification pins" ON public.death_verification_pins;
    CREATE POLICY "Users can view own death verification pins" 
    ON public.death_verification_pins 
    FOR SELECT USING (auth.uid() = user_id);

    RAISE NOTICE 'All RLS policies created successfully';
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS death_verification_settings_user_id_idx ON public.death_verification_settings(user_id);
CREATE INDEX IF NOT EXISTS death_verification_checkins_user_id_idx ON public.death_verification_checkins(user_id);
CREATE INDEX IF NOT EXISTS death_verification_checkins_next_check_in_idx ON public.death_verification_checkins(next_check_in);
CREATE INDEX IF NOT EXISTS death_verification_logs_user_id_idx ON public.death_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS death_verification_requests_user_id_idx ON public.death_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS death_verification_pins_user_id_idx ON public.death_verification_pins(user_id);

-- Add helpful comments
COMMENT ON TABLE public.death_verification_settings IS 'User settings for death verification check-in system';
COMMENT ON TABLE public.death_verification_checkins IS 'Record of user check-ins to confirm they are alive';
COMMENT ON TABLE public.death_verification_logs IS 'Audit trail for death verification system activities';
COMMENT ON TABLE public.death_verification_requests IS 'Death verification requests triggered by missed check-ins';
COMMENT ON TABLE public.death_verification_pins IS 'PIN codes for will access after death verification';

RAISE NOTICE 'Death verification system database schema setup completed successfully';
