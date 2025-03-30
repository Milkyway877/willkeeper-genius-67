import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'security';
  title: string;
  description: string;
  user_id?: string;
  read: boolean;
  created_at: string;
  icon?: string;
}

export interface NotificationPayload {
  title: string;
  description: string;
  icon?: string;
}

/**
 * Create a system notification for the current user
 */
export const createSystemNotification = async (
  type: 'success' | 'warning' | 'info' | 'security',
  payload: NotificationPayload
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type,
        title: payload.title,
        description: payload.description,
        icon: payload.icon,
        read: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    
    console.log("Notification created:", data);
    return data.id;
  } catch (error) {
    console.error('Error in createSystemNotification:', error);
    return null;
  }
};

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    // Enable realtime on the notifications table if needed
    try {
      await enableRealtimeForNotifications();
    } catch (err) {
      console.warn("Could not enable realtime for notifications:", err);
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .is('read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return false;
  }
};

/**
 * Enable realtime for the notifications table
 */
const enableRealtimeForNotifications = async (): Promise<void> => {
  // We don't actually call the SQL directly here as that would require admin rights
  // This is a placeholder for the actual implementation which would be done via SQL migration
  console.log("Would enable realtime for notifications table if admin rights were available");
  
  // In a real implementation, you'd run SQL like:
  // ALTER TABLE public.notifications REPLICA IDENTITY FULL;
  // INSERT INTO supabase_realtime.subscription (subscription_id, entity, claims, filters, created_at, updated_at)
  // VALUES ('public:notifications', 'public:notifications', '{"role":"authenticated"}', '{}', NOW(), NOW());
};
