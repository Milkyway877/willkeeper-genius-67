
-- Create a function that will be called by database triggers to create notifications automatically
CREATE OR REPLACE FUNCTION create_notification_on_event()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_title TEXT;
  v_description TEXT;
  v_type TEXT;
BEGIN
  -- Default to the user_id from the row if available
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Handle different tables and actions
  IF TG_TABLE_NAME = 'wills' THEN
    IF TG_OP = 'INSERT' THEN
      v_title := 'Will Created';
      v_description := 'A new will has been created in your account.';
      v_type := 'success';
    ELSIF TG_OP = 'UPDATE' THEN
      v_title := 'Will Updated';
      v_description := 'Your will has been updated.';
      v_type := 'info';
    ELSIF TG_OP = 'DELETE' THEN
      v_title := 'Will Deleted';
      v_description := 'A will has been deleted from your account.';
      v_type := 'warning';
    END IF;
  ELSIF TG_TABLE_NAME = 'user_security' THEN
    IF TG_OP = 'UPDATE' AND NEW.google_auth_enabled IS DISTINCT FROM OLD.google_auth_enabled THEN
      IF NEW.google_auth_enabled THEN
        v_title := 'Two-Factor Authentication Enabled';
        v_description := 'Two-factor authentication has been enabled for your account.';
        v_type := 'security';
      ELSE
        v_title := 'Two-Factor Authentication Disabled';
        v_description := 'Two-factor authentication has been disabled for your account.';
        v_type := 'security';
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME = 'user_profiles' THEN
    IF TG_OP = 'UPDATE' THEN
      v_title := 'Profile Updated';
      v_description := 'Your profile information has been updated.';
      v_type := 'info';
    END IF;
  END IF;

  -- If we have all the information we need, create the notification
  IF v_user_id IS NOT NULL AND v_title IS NOT NULL AND v_description IS NOT NULL AND v_type IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, description, type)
    VALUES (v_user_id, v_title, v_description, v_type);
    
    RETURN NEW;
  END IF;
  
  -- For DELETE operations or when no notification was created
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for various tables
DROP TRIGGER IF EXISTS wills_notification_trigger ON wills;
CREATE TRIGGER wills_notification_trigger
AFTER INSERT OR UPDATE OR DELETE ON wills
FOR EACH ROW EXECUTE FUNCTION create_notification_on_event();

DROP TRIGGER IF EXISTS user_security_notification_trigger ON user_security;
CREATE TRIGGER user_security_notification_trigger
AFTER UPDATE ON user_security
FOR EACH ROW EXECUTE FUNCTION create_notification_on_event();

DROP TRIGGER IF EXISTS user_profiles_notification_trigger ON user_profiles;
CREATE TRIGGER user_profiles_notification_trigger
AFTER UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION create_notification_on_event();

-- Make sure notifications table has proper indexes for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx ON notifications(user_id, created_at DESC);

-- Add a scheduled function that will check for subscription renewals and other periodic events
-- This would typically be executed by a cron job or scheduled task in a real production environment
CREATE OR REPLACE FUNCTION check_subscription_renewals()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find subscriptions that will renew in the next 7 days
  FOR user_record IN 
    SELECT s.user_id, s.end_date, u.email
    FROM subscriptions s
    JOIN auth.users u ON s.user_id = u.id
    WHERE s.end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
  LOOP
    -- Create a renewal notification
    INSERT INTO notifications (user_id, title, description, type)
    VALUES (
      user_record.user_id,
      'Subscription Renewal Reminder',
      'Your subscription will renew on ' || TO_CHAR(user_record.end_date, 'YYYY-MM-DD') || '. Please ensure your payment method is up to date.',
      'info'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_notification_on_event() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION check_subscription_renewals() TO postgres, service_role;
