
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
    // First, check if user is authenticated
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
    
    console.log('Notifications fetched:', data);
    
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

function validateNotificationType(type: string): 'success' | 'warning' | 'info' | 'security' {
  const validTypes = ['success', 'warning', 'info', 'security'];
  return validTypes.includes(type) ? type as 'success' | 'warning' | 'info' | 'security' : 'info';
}

export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot mark notification as read');
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', session.user.id); // Ensure we only update the current user's notifications
      
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
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot mark all notifications as read');
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
      .eq('user_id', session.user.id); // Ensure we only update the current user's notifications
      
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
      console.warn('No user logged in, skipping notification creation');
      return null;
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
      return null;
    }
    
    console.log('Notification created:', data);
    
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
      console.warn('No user logged in, cannot delete notifications');
      return false;
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

export const createWelcomeNotification = async (): Promise<Notification | null> => {
  return createNotification({
    title: "Welcome to WillTank",
    description: "Get started by creating your first will and securing your legacy.",
    type: 'info',
    read: false
  });
};

// Map event types to notification types
const eventTypeToNotificationType = (
  eventType: string
): 'success' | 'warning' | 'info' | 'security' => {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'security'> = {
    'will_updated': 'success',
    'document_uploaded': 'info',
    'security_key_generated': 'security',
    'beneficiary_added': 'info',
    'executor_added': 'info',
    'item_saved': 'success',
    'will_deleted': 'info'
  };
  
  return typeMap[eventType] || 'info'; // Default to 'info' if not in the map
};

export const createSystemNotification = async (
  type: 'success' | 'warning' | 'info' | 'security' | string,
  details: { title: string, description: string }
): Promise<Notification | null> => {
  // Check if user is authenticated first
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.warn('No user logged in, skipping system notification creation');
    return null;
  }
  
  // Convert event-based type to notification type if needed
  const notificationType = ['success', 'warning', 'info', 'security'].includes(type) 
    ? type as 'success' | 'warning' | 'info' | 'security'
    : eventTypeToNotificationType(type);
  
  console.log(`Creating ${notificationType} notification: ${details.title}`);
  
  return createNotification({
    title: details.title,
    description: details.description,
    type: notificationType,
    read: false
  });
};

// Legacy function - keeping for backward compatibility
export const createSystemNotification2 = async (
  event: 'will_updated' | 'document_uploaded' | 'security_key_generated' | 'beneficiary_added' | 'executor_added' | 'item_saved' | 'will_deleted',
  details?: { title?: string, description?: string, itemId?: string }
): Promise<Notification | null> => {
  // Check authentication first  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.warn('No user logged in, skipping system notification creation');
    return null;
  }
  
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
    },
    will_deleted: {
      title: 'Will Deleted',
      description: 'Your will has been deleted.',
      type: 'info'
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
