
-- Enable row-level changes for the notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Make sure the table exists in the realtime publication
SELECT pg_publication_tables('supabase_realtime');

-- Remove if exists to avoid errors
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS notifications;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Force a restart of the realtime service to ensure changes take effect
NOTIFY pgrst, 'reload schema';

-- Log that the migration was executed
DO $$
BEGIN
    RAISE NOTICE 'Enabled realtime for notifications table';
END $$;

-- Create a function that will check if notifications are working
CREATE OR REPLACE FUNCTION check_notification_system()
RETURNS TEXT AS $$
DECLARE
    publication_exists BOOLEAN;
    table_in_publication BOOLEAN;
    replica_identity_full BOOLEAN;
BEGIN
    -- Check if publication exists
    SELECT EXISTS(
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) INTO publication_exists;
    
    -- Check if notifications table is in the publication
    SELECT EXISTS(
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'notifications'
    ) INTO table_in_publication;
    
    -- Check replica identity
    SELECT relreplident = 'f' FROM pg_class
    WHERE oid = 'public.notifications'::regclass
    INTO replica_identity_full;
    
    -- Return status
    RETURN json_build_object(
        'publication_exists', publication_exists,
        'table_in_publication', table_in_publication,
        'replica_identity_full', replica_identity_full
    )::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Call the function immediately to check status
SELECT check_notification_system();

-- Add index on user_id and created_at for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
