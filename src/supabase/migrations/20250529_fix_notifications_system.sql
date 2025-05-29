
-- Fix Notifications System Completely
-- This migration addresses all issues with the notification system

-- First, ensure the notifications table has the correct structure
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at if they don't
UPDATE public.notifications 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after setting defaults
ALTER TABLE public.notifications 
ALTER COLUMN updated_at SET NOT NULL;

-- Create or replace the create_notification RPC function
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Validate the notification type
  IF p_type NOT IN ('info', 'success', 'warning', 'security') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;
  
  -- Insert the notification
  INSERT INTO public.notifications (user_id, title, description, type, read, created_at, updated_at)
  VALUES (p_user_id, p_title, p_description, p_type, false, NOW(), NOW())
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create notification: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;

-- Create a test notification function for debugging
CREATE OR REPLACE FUNCTION public.create_test_notification(
  p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_notification_id UUID;
BEGIN
  -- Use provided user_id or get current user
  IF p_user_id IS NULL THEN
    v_user_id := auth.uid();
  ELSE
    v_user_id := p_user_id;
  END IF;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user ID provided and no authenticated user found';
  END IF;
  
  -- Create a test notification
  SELECT public.create_notification(
    v_user_id,
    'Test Notification',
    'This is a test notification created at ' || NOW()::TEXT,
    'info'
  ) INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;

-- Fix user_security table to prevent the "multiple rows" error
-- First, let's check if there are duplicate user_security records
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id
    FROM public.user_security
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    -- Remove duplicates, keeping only the most recent record
    DELETE FROM public.user_security
    WHERE id NOT IN (
      SELECT DISTINCT ON (user_id) id
      FROM public.user_security
      ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
    );
    
    RAISE NOTICE 'Removed % duplicate user_security records', duplicate_count;
  END IF;
END $$;

-- Add a unique constraint to prevent future duplicates
ALTER TABLE public.user_security 
DROP CONSTRAINT IF EXISTS user_security_user_id_unique;

ALTER TABLE public.user_security 
ADD CONSTRAINT user_security_user_id_unique UNIQUE (user_id);

-- Ensure proper RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Ensure realtime is properly configured
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Remove and re-add the table to the realtime publication
DO $$
BEGIN
  -- Try to remove the table from publication (ignore if it doesn't exist)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
  EXCEPTION
    WHEN OTHERS THEN
      NULL; -- Ignore errors
  END;
  
  -- Add the table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
END $$;

-- Create a function to check notification system health
CREATE OR REPLACE FUNCTION public.check_notification_system_health()
RETURNS JSON AS $$
DECLARE
  result JSON;
  test_user_id UUID;
  test_notification_id UUID;
  notification_count INTEGER;
BEGIN
  -- Get the current user ID
  test_user_id := auth.uid();
  
  IF test_user_id IS NULL THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'No authenticated user found'
    );
  END IF;
  
  -- Count existing notifications for the user
  SELECT COUNT(*) INTO notification_count
  FROM public.notifications
  WHERE user_id = test_user_id;
  
  -- Try to create a test notification
  BEGIN
    SELECT public.create_notification(
      test_user_id,
      'System Health Check',
      'Notification system is working correctly',
      'info'
    ) INTO test_notification_id;
    
    result := json_build_object(
      'status', 'success',
      'message', 'Notification system is working',
      'user_id', test_user_id,
      'existing_notifications', notification_count,
      'test_notification_id', test_notification_id,
      'rpc_function', 'working',
      'database_connection', 'working'
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      result := json_build_object(
        'status', 'error',
        'message', 'Failed to create test notification: ' || SQLERRM,
        'user_id', test_user_id,
        'existing_notifications', notification_count
      );
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_notification_system_health TO authenticated;

-- Create automatic notification triggers for common events
CREATE OR REPLACE FUNCTION public.create_automatic_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_description TEXT;
  v_type TEXT := 'info';
  v_user_id UUID;
BEGIN
  -- Get the user_id from the affected row
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;
  
  -- Skip if no user_id
  IF v_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Determine notification content based on table and operation
  CASE TG_TABLE_NAME
    WHEN 'wills' THEN
      CASE TG_OP
        WHEN 'INSERT' THEN
          v_title := 'Will Created';
          v_description := 'A new will has been created successfully.';
          v_type := 'success';
        WHEN 'UPDATE' THEN
          v_title := 'Will Updated';
          v_description := 'Your will has been updated.';
          v_type := 'info';
        WHEN 'DELETE' THEN
          v_title := 'Will Deleted';
          v_description := 'A will has been deleted from your account.';
          v_type := 'warning';
      END CASE;
    WHEN 'user_profiles' THEN
      IF TG_OP = 'UPDATE' THEN
        v_title := 'Profile Updated';
        v_description := 'Your profile information has been updated.';
        v_type := 'info';
      END IF;
    ELSE
      -- Don't create notifications for other tables
      RETURN COALESCE(NEW, OLD);
  END CASE;
  
  -- Create the notification if we have content
  IF v_title IS NOT NULL THEN
    BEGIN
      PERFORM public.create_notification(v_user_id, v_title, v_description, v_type);
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error but don't fail the original operation
        RAISE WARNING 'Failed to create automatic notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic notifications
DROP TRIGGER IF EXISTS wills_notification_trigger ON public.wills;
CREATE TRIGGER wills_notification_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.wills
  FOR EACH ROW EXECUTE FUNCTION public.create_automatic_notification();

DROP TRIGGER IF EXISTS user_profiles_notification_trigger ON public.user_profiles;
CREATE TRIGGER user_profiles_notification_trigger
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_automatic_notification();

-- Log successful completion
DO $$
BEGIN
  RAISE NOTICE 'Notification system migration completed successfully';
END $$;
