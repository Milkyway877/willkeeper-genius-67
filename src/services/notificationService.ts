
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'security';
  read: boolean;
  created_at: string;
  icon?: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    // Convert database type string to our Notification type
    return (data || []).map(item => ({
      ...item,
      type: validateNotificationType(item.type)
    })) as Notification[];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
};

// Helper function to validate notification types
function validateNotificationType(type: string): 'success' | 'warning' | 'info' | 'security' {
  const validTypes = ['success', 'warning', 'info', 'security'];
  return validTypes.includes(type) ? type as 'success' | 'warning' | 'info' | 'security' : 'info';
}

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

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);
      
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

export const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at'>): Promise<Notification | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Ensure the type is valid
    const validatedType = validateNotificationType(notification.type);
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        type: validatedType,
        user_id: session.user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    return {
      ...data,
      type: validateNotificationType(data.type)
    } as Notification;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
};
