
-- Add missing grace_period column to death_verification_settings table
-- This migration fixes the database error in the death verification system

-- Add grace_period column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'death_verification_settings' 
        AND column_name = 'grace_period'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD COLUMN grace_period INTEGER DEFAULT 7 NOT NULL;
        
        RAISE NOTICE 'Added grace_period column to death_verification_settings table';
    ELSE
        RAISE NOTICE 'grace_period column already exists in death_verification_settings table';
    END IF;
END $$;

-- Update any existing records to have a default grace period of 7 days if null
UPDATE public.death_verification_settings 
SET grace_period = 7 
WHERE grace_period IS NULL;

-- Add check constraint to ensure grace period is reasonable (1-30 days)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'death_verification_settings_grace_period_check'
    ) THEN
        ALTER TABLE public.death_verification_settings 
        ADD CONSTRAINT death_verification_settings_grace_period_check 
        CHECK (grace_period >= 1 AND grace_period <= 30);
        
        RAISE NOTICE 'Added grace_period check constraint';
    END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN public.death_verification_settings.grace_period IS 'Number of days after missed check-in before triggering death verification process';

RAISE NOTICE 'Death verification settings table updated successfully';
