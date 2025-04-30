
-- First, check if the notifications table has RLS enabled
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'notifications' 
    AND schemaname = 'public' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Drop existing RLS policies on notifications table to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Create proper RLS policies for the notifications table
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Make sure user_id is properly indexed for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Make sure the timestamp triggers are set up properly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_notifications_timestamp'
  ) THEN
    CREATE TRIGGER update_notifications_timestamp
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END
$$;
