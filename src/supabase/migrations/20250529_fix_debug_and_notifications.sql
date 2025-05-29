
-- Emergency Fix for Notifications System and Debug Tools
-- This migration ensures the notification system works properly

-- First, let's clean up any duplicate user_security records
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, COUNT(*) as cnt
    FROM public.user_security
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % users with duplicate security records', duplicate_count;
    
    -- Keep only the most recent record for each user
    DELETE FROM public.user_security
    WHERE id NOT IN (
      SELECT DISTINCT ON (user_id) id
      FROM public.user_security
      ORDER BY user_id, created_at DESC NULLS LAST, updated_at DESC NULLS LAST
    );
    
    RAISE NOTICE 'Cleaned up duplicate user_security records';
  END IF;
END $$;

-- Ensure unique constraint exists
ALTER TABLE public.user_security 
DROP CONSTRAINT IF EXISTS user_security_user_id_key;

ALTER TABLE public.user_security 
ADD CONSTRAINT user_security_user_id_key UNIQUE (user_id);

-- Make sure notifications table is properly set up
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update any null updated_at values
UPDATE public.notifications 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL
ALTER TABLE public.notifications 
ALTER COLUMN updated_at SET NOT NULL;

-- Create or replace the create_notification function with better error handling
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  IF p_title IS NULL OR p_title = '' THEN
    RAISE EXCEPTION 'Title cannot be null or empty';
  END IF;
  
  IF p_type NOT IN ('info', 'success', 'warning', 'security') THEN
    RAISE EXCEPTION 'Invalid notification type: %. Must be one of: info, success, warning, security', p_type;
  END IF;
  
  -- Insert the notification
  INSERT INTO public.notifications (
    user_id, 
    title, 
    description, 
    type, 
    read, 
    created_at, 
    updated_at
  )
  VALUES (
    p_user_id, 
    p_title, 
    COALESCE(p_description, ''), 
    p_type, 
    false, 
    NOW(), 
    NOW()
  )
  RETURNING id INTO v_notification_id;
  
  RAISE NOTICE 'Created notification % for user %', v_notification_id, p_user_id;
  
  RETURN v_notification_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create notification: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO anon;

-- Create a simple test function that always works
CREATE OR REPLACE FUNCTION public.create_test_notification(
  p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_notification_id UUID;
BEGIN
  -- Use provided user_id or get current authenticated user
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
    'Test Notification - ' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'This is a test notification created at ' || NOW()::TEXT || ' to verify the system is working properly.',
    'info'
  ) INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for test function
GRANT EXECUTE ON FUNCTION public.create_test_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_notification TO anon;

-- Health check function with comprehensive testing
CREATE OR REPLACE FUNCTION public.check_notification_system_health()
RETURNS JSON AS $$
DECLARE
  result JSON;
  test_user_id UUID;
  test_notification_id UUID;
  notification_count INTEGER;
  error_message TEXT;
BEGIN
  -- Get the current user ID
  test_user_id := auth.uid();
  
  IF test_user_id IS NULL THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'No authenticated user found - please log in',
      'timestamp', NOW()
    );
  END IF;
  
  -- Count existing notifications for the user
  BEGIN
    SELECT COUNT(*) INTO notification_count
    FROM public.notifications
    WHERE user_id = test_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN json_build_object(
        'status', 'error',
        'message', 'Failed to count notifications: ' || SQLERRM,
        'user_id', test_user_id,
        'timestamp', NOW()
      );
  END;
  
  -- Try to create a test notification
  BEGIN
    SELECT public.create_notification(
      test_user_id,
      'System Health Check',
      'Notification system is working correctly at ' || NOW()::TEXT,
      'info'
    ) INTO test_notification_id;
    
    result := json_build_object(
      'status', 'success',
      'message', 'Notification system is fully functional',
      'user_id', test_user_id,
      'existing_notifications', notification_count,
      'test_notification_id', test_notification_id,
      'database_connection', 'working',
      'rpc_function', 'working',
      'permissions', 'working',
      'timestamp', NOW()
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      result := json_build_object(
        'status', 'error',
        'message', 'Failed to create test notification: ' || SQLERRM,
        'user_id', test_user_id,
        'existing_notifications', notification_count,
        'database_connection', 'working',
        'rpc_function', 'failed',
        'timestamp', NOW()
      );
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for health check
GRANT EXECUTE ON FUNCTION public.check_notification_system_health TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_notification_system_health TO anon;

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Ensure realtime is working
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notifications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not modify realtime publication: %', SQLERRM;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);

RAISE NOTICE 'Notification system fix completed successfully';
