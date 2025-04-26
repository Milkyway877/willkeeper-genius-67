
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'security';
  read: boolean;
  created_at: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot fetch notifications');
      return [];
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

// Add the missing function for marking all notifications as read
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot mark notifications as read');
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
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

export const createSystemNotification = async (
  type: 'success' | 'warning' | 'info' | 'security',
  details: { title: string, description: string }
): Promise<Notification | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No user logged in, skipping notification creation');
      return null;
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id,
        type,
        title: details.title,
        description: details.description,
        read: false
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

// Add welcome notification helper function
export const createWelcomeNotification = async (): Promise<Notification | null> => {
  return createSystemNotification('success', {
    title: 'Welcome to WillTank',
    description: 'Your secure digital legacy platform. Get started by exploring the dashboard.'
  });
};
