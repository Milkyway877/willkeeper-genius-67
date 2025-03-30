
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export type NotificationType = 'success' | 'warning' | 'info' | 'security';

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string | null;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPayload {
  title: string;
  description?: string;
}

// Event to notification type mapping
const eventTypeMap: Record<string, NotificationType> = {
  'item_saved': 'success',
  'document_uploaded': 'success',
  'will_deleted': 'warning',
  'executor_added': 'info',
  'beneficiary_added': 'info',
  'will_updated': 'success',
  'security_key_generated': 'security'
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) {
      console.warn('User not authenticated, cannot fetch notifications');
      return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

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

export const createNotificationForEvent = async (eventType: string, payload: NotificationPayload): Promise<Notification | null> => {
  // Map event type to notification type
  const notificationType: NotificationType = eventTypeMap[eventType] || 'info';
  
  // Call createSystemNotification with the mapped notification type
  return createSystemNotification(notificationType, payload);
};

export const createSystemNotification = async (type: NotificationType, payload: NotificationPayload): Promise<Notification | null> => {
  try {
    // Show toast notification
    toast[type === 'security' ? 'info' : type](payload.title, {
      description: payload.description || ''
    });

    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) {
      // Just show the toast notification if user is not logged in
      return null;
    }

    // Insert into the database
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: auth.session.user.id,
        title: payload.title,
        message: payload.description || null,
        type: type,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createSystemNotification:', error);
    return null;
  }
};

export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
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

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) {
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', auth.session.user.id)
      .eq('is_read', false);

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

export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return false;
  }
};

export const notifyWelcome = () => {
  toast.success('Welcome to WillTank!', {
    description: 'Your secure platform for legacy planning.',
    duration: 5000
  });
};
