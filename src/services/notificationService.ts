
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'security';
  read: boolean;
  created_at: string;
  updated_at: string;
}

export type EventType = 
  | 'will_created' 
  | 'will_updated' 
  | 'will_signed' 
  | 'will_deleted' 
  | 'document_uploaded' 
  | 'document_deleted' 
  | 'document_shared'
  | 'beneficiary_added'
  | 'executor_added'
  | 'contact_verified'
  | 'trusted_contact_added'
  | 'trusted_contact_verified'
  | 'security_key_generated'
  | 'new_login'
  | 'password_changed'
  | 'subscription_changed'
  | 'subscription_renewal'
  | 'payment_failed'
  | 'system_maintenance'
  | 'system_update'
  | 'death_verification_setup'
  | 'death_verification_checkin'
  | 'death_verification_missed_checkin'
  | 'info'
  | 'success'
  | 'warning'
  | 'security'
  | 'item_saved';

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return [];
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
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
      .update({ read: true, updated_at: new Date().toISOString() })
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
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
  eventType: EventType, 
  details: { title: string, description: string, itemId?: string }
): Promise<Notification | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return null;
    }
    
    // Determine notification type based on event type
    let notificationType: 'info' | 'success' | 'warning' | 'security' = 'info';
    
    switch (eventType) {
      case 'will_created':
      case 'will_signed':
      case 'success':
      case 'item_saved':
      case 'trusted_contact_verified':
      case 'contact_verified':
        notificationType = 'success';
        break;
      case 'will_deleted':
      case 'document_deleted':
      case 'warning':
      case 'death_verification_missed_checkin':
        notificationType = 'warning';
        break;
      case 'new_login':
      case 'password_changed':
      case 'security_key_generated':
      case 'security':
        notificationType = 'security';
        break;
      default:
        notificationType = 'info';
    }
    
    const newNotification = {
      user_id: session.user.id,
      title: details.title,
      description: details.description,
      type: notificationType,
      read: false
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(newNotification)
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
