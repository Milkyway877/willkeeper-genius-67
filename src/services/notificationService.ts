
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

// Type validation helper
export function validateNotificationType(type: string): 'success' | 'warning' | 'info' | 'security' {
  const validTypes = ['success', 'warning', 'info', 'security'];
  return validTypes.includes(type) ? type as 'success' | 'warning' | 'info' | 'security' : 'info';
}

// Map event types to notification types
export const eventTypeToNotificationType = (
  eventType: string
): 'success' | 'warning' | 'info' | 'security' => {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'security'> = {
    'will_created': 'success',
    'will_updated': 'success',
    'will_deleted': 'info',
    'document_uploaded': 'info',
    'document_updated': 'info',
    'document_deleted': 'info',
    
    'security_key_generated': 'security',
    'password_changed': 'security',
    'login_attempt': 'security',
    'recovery_requested': 'security',
    
    'profile_updated': 'info',
    'settings_changed': 'info',
    'avatar_updated': 'info',
    
    'beneficiary_added': 'info',
    'beneficiary_removed': 'info',
    'executor_added': 'info',
    'executor_removed': 'info',
    
    'vault_item_added': 'success',
    'vault_item_updated': 'info',
    'vault_item_deleted': 'info',
    'item_encrypted': 'security',
    'item_decrypted': 'security',
    
    'message_scheduled': 'success',
    'message_delivered': 'info',
    'message_cancelled': 'info',
    
    'welcome': 'info',
    'feature_tip': 'info',
    'account_created': 'success'
  };
  
  return typeMap[eventType] || 'info';
};

// Core function to create a notification
export const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at'>): Promise<Notification | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No user logged in, skipping notification creation');
      return null;
    }
    
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
    
    return {
      ...data,
      type: validateNotificationType(data.type)
    } as Notification;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
};

// Create a system notification with a specific type and details
export const createSystemNotification = async (
  type: 'success' | 'warning' | 'info' | 'security' | string,
  details: { title: string, description: string }
): Promise<Notification | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.warn('No user logged in, skipping system notification creation');
    return null;
  }
  
  const notificationType = ['success', 'warning', 'info', 'security'].includes(type) 
    ? type as 'success' | 'warning' | 'info' | 'security'
    : eventTypeToNotificationType(type);
  
  return createNotification({
    title: details.title,
    description: details.description,
    type: notificationType,
    read: false
  });
};

// Specific notification functions for vault items
export const notifyVaultItemAdded = async (itemType: string, title: string): Promise<Notification | null> => {
  return createSystemNotification('vault_item_added', {
    title: `${itemType} Added to Vault`,
    description: `"${title}" has been added to your Legacy Vault.`
  });
};

export const notifyVaultItemUpdated = async (itemType: string, title: string): Promise<Notification | null> => {
  return createSystemNotification('vault_item_updated', {
    title: `${itemType} Updated`,
    description: `"${title}" in your Legacy Vault has been updated.`
  });
};

// Specific notification functions for will management
export const notifyWillCreated = async (title: string): Promise<Notification | null> => {
  return createSystemNotification('will_created', {
    title: "Will Created",
    description: `Your will "${title}" has been successfully created.`
  });
};

export const notifyWillUpdated = async (title: string): Promise<Notification | null> => {
  return createSystemNotification('will_updated', {
    title: "Will Updated",
    description: `Your will "${title}" has been successfully updated.`
  });
};

// Specific notification functions for document management
export const notifyDocumentUploaded = async (details: { title?: string, description?: string, itemId?: string }): Promise<Notification | null> => {
  return createSystemNotification('document_uploaded', {
    title: details.title || "Document Uploaded",
    description: details.description || "A new document has been uploaded to your account."
  });
};

// Specific notification functions for profile updates
export const notifyProfileUpdated = async (field?: string): Promise<Notification | null> => {
  return createSystemNotification('profile_updated', {
    title: "Profile Updated",
    description: field 
      ? `Your ${field.toLowerCase()} has been successfully updated.`
      : "Your profile information has been successfully updated."
  });
};

// Specific notification functions for security events
export const notifySecurityEvent = async (event: string, details: string): Promise<Notification | null> => {
  return createSystemNotification('security', {
    title: event,
    description: details
  });
};

// Specific notification functions for message scheduling
export const notifyMessageScheduled = async (recipient: string, date: string): Promise<Notification | null> => {
  return createSystemNotification('message_scheduled', {
    title: "Future Message Scheduled",
    description: `Your message to ${recipient} has been scheduled for ${date}.`
  });
};

// Feature tip notification
export const createFeatureTipNotification = async (
  feature: string,
  description: string
): Promise<Notification | null> => {
  return createSystemNotification('feature_tip', {
    title: `Tip: ${feature}`,
    description
  });
};

// Welcome notification
export const createWelcomeNotification = async (): Promise<Notification | null> => {
  return createNotification({
    title: "Welcome to WillTank",
    description: "Get started by creating your first will and securing your legacy.",
    type: 'info',
    read: false
  });
};

// Welcome notification pack
export const createWelcomeNotificationPack = async (): Promise<boolean> => {
  try {
    await createSystemNotification('welcome', {
      title: "Welcome to WillTank",
      description: "Thank you for joining WillTank. We're here to help you secure your legacy and prepare for the future."
    });
    
    await createSystemNotification('security', {
      title: "Security Tip",
      description: "For maximum security, we recommend enabling two-factor authentication in your profile settings."
    });
    
    await createSystemNotification('feature_tip', {
      title: "Create Your First Will",
      description: "Get started by creating your first will. Our guided process makes it easy to document your wishes."
    });
    
    await createSystemNotification('feature_tip', {
      title: "Legacy Vault",
      description: "Store important documents and memories in your Legacy Vault for your loved ones."
    });
    
    await createSystemNotification('feature_tip', {
      title: "Schedule Future Messages",
      description: "Leave personal messages to be delivered to your loved ones in the future."
    });
    
    return true;
  } catch (error) {
    console.error('Error creating welcome notification pack:', error);
    return false;
  }
};

// Alternative system notification function with predefined templates
export const createSystemNotification2 = async (
  event: 'will_updated' | 'document_uploaded' | 'security_key_generated' | 'beneficiary_added' | 'executor_added' | 'item_saved' | 'will_deleted',
  details?: { title?: string, description?: string, itemId?: string }
): Promise<Notification | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.warn('No user logged in, skipping system notification creation');
    return null;
  }
  
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

// Get all notifications for the current user
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
    
    return (data || []).map(item => ({
      ...item,
      type: validateNotificationType(item.type)
    })) as Notification[];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot mark notification as read');
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', session.user.id);
      
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

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot mark all notifications as read');
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
      .eq('user_id', session.user.id);
      
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

// Delete all notifications for the current user
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
