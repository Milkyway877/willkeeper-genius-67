
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
  | 'will_document_added'
  | 'will_document_removed'
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
  | 'item_saved'
  | 'check_in_completed'
  | 'check_in_missed'
  | 'check_in_scheduled';

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
      case 'trusted_contact_added':
      case 'check_in_completed':
        notificationType = 'success';
        break;
      case 'will_deleted':
      case 'document_deleted':
      case 'warning':
      case 'death_verification_missed_checkin':
      case 'check_in_missed':
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
    
    console.log(`Creating notification: ${eventType} - ${details.title} (${notificationType})`);
    
    // Try the RPC method first
    try {
      console.log('Attempting to create notification via RPC method...');
      const { data: notificationId, error: rpcError } = await supabase.rpc(
        'create_notification',
        {
          p_user_id: session.user.id,
          p_title: details.title,
          p_description: details.description,
          p_type: notificationType
        }
      );
      
      if (rpcError) {
        console.warn('RPC method failed, using fallback:', rpcError);
        throw new Error('RPC method failed');
      }
      
      console.log('RPC method succeeded with notification ID:', notificationId);
      
      if (notificationId) {
        // Fetch the newly created notification to return it
        const { data: notification } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', notificationId)
          .single();
          
        return notification;
      }
    } catch (rpcError) {
      console.error('Error using RPC for notification:', rpcError);
      // Continue to edge function fallback
    }
    
    // Edge function fallback
    try {
      console.log('Attempting to create notification via edge function...');
      const response = await fetch(`${window.location.origin}/functions/v1/create-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_PUBLISHABLE_KEY || ''
        },
        body: JSON.stringify({
          title: details.title,
          description: details.description,
          type: notificationType
        })
      });
      
      if (!response.ok) {
        console.warn('Edge function failed with status:', response.status);
        
        // Try to get more details from the response
        try {
          const errorBody = await response.text();
          console.warn('Edge function error response:', errorBody);
        } catch (e) {
          console.warn('Could not parse edge function error response');
        }
        
        throw new Error(`Edge function returned ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Edge function succeeded with response:', responseData);
      
      // Use the notification ID returned by the edge function
      if (responseData.notification_id) {
        // Fetch the newly created notification to return it
        const { data: notification } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', responseData.notification_id)
          .single();
          
        return notification;
      }
    } catch (edgeFunctionError) {
      console.error('Edge function fallback failed:', edgeFunctionError);
      // Continue to direct insert fallback
    }
    
    // Direct insert fallback as last resort
    try {
      console.log('Attempting to create notification via direct insert...');
      const { data: directInsert, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: session.user.id,
          title: details.title,
          description: details.description,
          type: notificationType,
          read: false
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('Direct insert also failed:', insertError);
        
        // Last resort: Show a toast notification even if we can't save it
        toast({
          title: details.title,
          description: details.description,
          variant: notificationType === 'security' ? 'destructive' : 'default',
        });
        
        return null;
      }
      
      console.log('Direct insert succeeded with notification:', directInsert);
      return directInsert;
    } catch (insertError) {
      console.error('All notification creation methods failed:', insertError);
      return null;
    }
  } catch (error) {
    console.error('Error in createSystemNotification:', error);
    return null;
  }
};

// Add a specialized check-in notification function for the current page
export const createCheckInNotification = async (
  checkInType: 'completed' | 'missed' | 'scheduled',
  details?: { date?: string, nextDate?: string }
): Promise<Notification | null> => {
  let title = '';
  let description = '';
  let eventType: EventType;
  
  switch (checkInType) {
    case 'completed':
      title = 'Check-In Completed';
      description = `You have successfully completed your check-in${details?.date ? ` on ${details.date}` : ''}.`;
      eventType = 'check_in_completed';
      break;
    case 'missed':
      title = 'Check-In Missed';
      description = `You missed your scheduled check-in${details?.date ? ` on ${details.date}` : ''}.`;
      eventType = 'check_in_missed';
      break;
    case 'scheduled':
      title = 'Check-In Scheduled';
      description = `Your next check-in is scheduled${details?.nextDate ? ` for ${details.nextDate}` : ''}.`;
      eventType = 'check_in_scheduled';
      break;
  }
  
  return await createSystemNotification(eventType, { title, description });
};
