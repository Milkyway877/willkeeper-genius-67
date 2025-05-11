
-- Create notification logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  email_id TEXT,
  error TEXT,
  content_type TEXT NOT NULL DEFAULT 'notification',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Make sure the notifications table exists and has the correct structure
CREATE TABLE IF NOT EXISTS notifications (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('success', 'warning', 'info', 'security')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE indexname = 'notifications_user_id_idx'
  ) THEN
      CREATE INDEX notifications_user_id_idx ON notifications(user_id);
  END IF;
  
  IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE indexname = 'notifications_created_at_idx'
  ) THEN
      CREATE INDEX notifications_created_at_idx ON notifications(created_at);
  END IF;
  
  IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE indexname = 'notifications_read_idx'
  ) THEN
      CREATE INDEX notifications_read_idx ON notifications(read);
  END IF;
END $$;

-- Make sure we have RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors
DROP POLICY IF EXISTS notifications_select_policy ON public.notifications;
DROP POLICY IF EXISTS notifications_update_policy ON public.notifications;
DROP POLICY IF EXISTS notifications_insert_policy ON public.notifications;
DROP POLICY IF EXISTS notification_logs_insert_policy ON public.notification_logs;

-- Create new policies
-- Users can only view their own notifications
CREATE POLICY notifications_select_policy ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own notifications (for marking as read)
CREATE POLICY notifications_update_policy ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert notifications via the create_notification function
CREATE POLICY notifications_insert_policy ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can insert notification logs
CREATE POLICY notification_logs_insert_policy ON public.notification_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- Create a function to create notifications that will definitely work
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Validate the type parameter
  IF p_type NOT IN ('success', 'warning', 'info', 'security') THEN
    RAISE EXCEPTION 'Invalid notification type: %. Must be one of: success, warning, info, security', p_type;
  END IF;

  -- Insert the notification
  INSERT INTO public.notifications (user_id, title, description, type)
  VALUES (p_user_id, p_title, p_description, p_type)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role, anon;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated, service_role, anon;
GRANT INSERT ON public.notification_logs TO service_role;

-- Re-enable realtime for notifications to ensure it works
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Ensure the notifications table has replica identity full for realtime updates
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
