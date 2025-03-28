
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

export const deleteAllNotifications = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error deleting notifications:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteAllNotifications:', error);
    return false;
  }
};

// Create welcome notification for new users
export const createWelcomeNotification = async (): Promise<Notification | null> => {
  return createNotification({
    title: "Welcome to WillTank",
    description: "Get started by creating your first will and securing your legacy.",
    type: 'info',
    read: false
  });
};

// Utility function to create notifications for common events
export const createSystemNotification = async (
  event: 'will_updated' | 'document_uploaded' | 'security_key_generated' | 'beneficiary_added' | 'executor_added' | 'item_saved',
  details?: { title?: string, description?: string, itemId?: string }
): Promise<Notification | null> => {
  // Default notification templates based on event type
  const notificationTemplates: Record<string, { title: string, description: string, type: 'success' | 'warning' | 'info' | 'security' }> = {
    will_updated: {
      title: 'Will Updated',
      description: 'Your will has been successfully updated.',
      type: 'success'
    },
    document_uploaded: {
      title: 'Document Uploaded',
      description: 'A new document has been uploaded to your account.',
      type: 'info'
    },
    security_key_generated: {
      title: 'Security Key Generated',
      description: 'A new security key has been generated for your account.',
      type: 'security'
    },
    beneficiary_added: {
      title: 'Beneficiary Added',
      description: 'A new beneficiary has been added to your will.',
      type: 'info'
    },
    executor_added: {
      title: 'Executor Added',
      description: 'A new executor has been added to your will.',
      type: 'info'
    },
    item_saved: {
      title: 'Item Saved',
      description: 'A new item has been saved to your account.',
      type: 'success'
    }
  };

  const template = notificationTemplates[event];
  
  if (!template) {
    console.error('Invalid notification event type:', event);
    return null;
  }

  return createNotification({
    title: details?.title || template.title,
    description: details?.description || template.description,
    type: template.type,
    read: false
  });
};
