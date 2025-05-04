
-- Make sure the notifications table is properly set up
CREATE TABLE IF NOT EXISTS public.notifications (
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
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);

-- Make sure we have RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
DROP POLICY IF EXISTS notifications_select_policy ON public.notifications;
CREATE POLICY notifications_select_policy ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own notifications (for marking as read)
DROP POLICY IF EXISTS notifications_update_policy ON public.notifications;
CREATE POLICY notifications_update_policy ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert notifications via the create_notification function
DROP POLICY IF EXISTS notifications_insert_policy ON public.notifications;
CREATE POLICY notifications_insert_policy ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, description, type)
  VALUES (p_user_id, p_title, p_description, p_type)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

-- Re-enable realtime for notifications to ensure it works
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Ensure the notifications table has replica identity full for realtime updates
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Force redeployment of the edge function
SELECT pg_notify('supabase_functions', 'reload:create-notification');

-- Update the create-notification edge function permissions
DROP FUNCTION IF EXISTS create_notification_for_user();
CREATE FUNCTION create_notification_for_user() 
RETURNS VOID AS $$
BEGIN
  GRANT EXECUTE ON FUNCTION create_notification TO anon, authenticated, service_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT create_notification_for_user();
