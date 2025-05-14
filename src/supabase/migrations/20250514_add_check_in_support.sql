
-- Add frequency column to future_messages table
ALTER TABLE future_messages ADD COLUMN IF NOT EXISTS frequency TEXT;

-- Add last_check_in_response column to track when the user last responded
ALTER TABLE future_messages ADD COLUMN IF NOT EXISTS last_check_in_response TIMESTAMP WITH TIME ZONE;

-- Add trusted_contacts column to store contacts to notify if check-in is missed
ALTER TABLE future_messages ADD COLUMN IF NOT EXISTS trusted_contacts TEXT[];

-- Add new message type for check-ins
DO $$
BEGIN
    -- Check if enum exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type_enum') THEN
        -- Alter the enum to add the new value if it doesn't exist
        BEGIN
            ALTER TYPE message_type_enum ADD VALUE IF NOT EXISTS 'check-in';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Value already exists, do nothing
        END;
    END IF;
END$$;

-- Add new delivery type for recurring messages
DO $$
BEGIN
    -- Check if enum exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_type_enum') THEN
        -- Alter the enum to add the new value if it doesn't exist
        BEGIN
            ALTER TYPE delivery_type_enum ADD VALUE IF NOT EXISTS 'recurring';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Value already exists, do nothing
        END;
    END IF;
END$$;

-- Create a new notification type for check-ins
DO $$
BEGIN
    -- Check if enum exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        -- Alter the enum to add the new values if they don't exist
        BEGIN
            ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'check_in_completed';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Value already exists, do nothing
        END;
        BEGIN
            ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'check_in_missed';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Value already exists, do nothing
        END;
        BEGIN
            ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'check_in_scheduled';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Value already exists, do nothing
        END;
    END IF;
END$$;

-- Add any missing categories
DO $$
BEGIN
    -- Check if enum exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_category_enum') THEN
        -- Alter the enum to add the new value if it doesn't exist
        BEGIN
            ALTER TYPE message_category_enum ADD VALUE IF NOT EXISTS 'check-in';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Value already exists, do nothing
        END;
    END IF;
END$$;

-- Add index on frequency to improve query performance for check-ins
CREATE INDEX IF NOT EXISTS idx_future_messages_frequency ON future_messages(frequency);

-- Add index on message_type for check-in filtering
CREATE INDEX IF NOT EXISTS idx_future_messages_message_type ON future_messages(message_type);
