
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  createSystemNotification, 
  notifyWillCreated,
  notifyWillUpdated,
  notifyDocumentUploaded,
  notifyProfileUpdated,
  notifySecurityEvent,
  notifyVaultItemAdded,
  notifyVaultItemUpdated,
  notifyMessageScheduled,
  createFeatureTipNotification
} from '@/services/notificationService';
import { useNotifications as useNotificationsContext } from '@/contexts/NotificationsContext';

export type NotificationPriority = 'low' | 'medium' | 'high';

export function useNotifications() {
  // Use the notifications context if available
  let notificationsContext;
  try {
    notificationsContext = useNotificationsContext();
  } catch (error) {
    console.warn("NotificationsContext not available, some features may be limited");
    notificationsContext = null;
  }

  // Function to show a toast and optionally create a persistent notification
  const notify = useCallback(async (
    type: 'success' | 'warning' | 'info' | 'security',
    title: string, 
    description: string,
    priority: NotificationPriority = 'medium'
  ) => {
    // Always show an immediate toast
    toast({
      title,
      description,
      variant: type === 'security' ? 'destructive' : 'default',
    });
    
    // Don't store low priority notifications
    if (priority === 'low') {
      return null;
    }
    
    // Create a persistent notification if priority is medium or high
    try {
      return await createSystemNotification(type, { title, description });
    } catch (error) {
      console.error(`Failed to create ${type} notification:`, error);
      return null;
    }
  }, []);

  // Convenience wrappers for specific notification types
  const notifySuccess = useCallback((title: string, description: string, priority: NotificationPriority = 'medium') => {
    return notify('success', title, description, priority);
  }, [notify]);
  
  const notifyInfo = useCallback((title: string, description: string, priority: NotificationPriority = 'medium') => {
    return notify('info', title, description, priority);
  }, [notify]);
  
  const notifyWarning = useCallback((title: string, description: string, priority: NotificationPriority = 'medium') => {
    return notify('warning', title, description, priority);
  }, [notify]);
  
  const notifySecurity = useCallback((title: string, description: string, priority: NotificationPriority = 'high') => {
    return notify('security', title, description, priority);
  }, [notify]);

  // Specialized notification methods for common application events
  const notifyWillCreatedAction = useCallback((willTitle: string) => {
    return notifyWillCreated(willTitle);
  }, []);

  const notifyWillUpdatedAction = useCallback((willTitle: string) => {
    return notifyWillUpdated(willTitle);
  }, []);

  const notifyDocumentUploadedAction = useCallback((docType: string, docTitle: string) => {
    return notifyDocumentUploaded(docType, docTitle);
  }, []);

  const notifyProfileUpdatedAction = useCallback((field?: string) => {
    return notifyProfileUpdated(field);
  }, []);

  const notifySecurityAction = useCallback((event: string, details: string) => {
    return notifySecurityEvent(event, details);
  }, []);

  const notifyVaultItemAddedAction = useCallback((itemType: string, title: string) => {
    return notifyVaultItemAdded(itemType, title);
  }, []);

  const notifyVaultItemUpdatedAction = useCallback((itemType: string, title: string) => {
    return notifyVaultItemUpdated(itemType, title);
  }, []);

  const notifyMessageScheduledAction = useCallback((recipient: string, date: string) => {
    return notifyMessageScheduled(recipient, date);
  }, []);

  const showFeatureTip = useCallback((feature: string, description: string) => {
    return createFeatureTipNotification(feature, description);
  }, []);

  return {
    // General notification methods
    notify,
    notifySuccess,
    notifyInfo,
    notifyWarning,
    notifySecurity,
    
    // Specific event notification methods
    notifyWillCreated: notifyWillCreatedAction,
    notifyWillUpdated: notifyWillUpdatedAction,
    notifyDocumentUploaded: notifyDocumentUploadedAction,
    notifyProfileUpdated: notifyProfileUpdatedAction,
    notifySecurity: notifySecurityAction,
    notifyVaultItemAdded: notifyVaultItemAddedAction,
    notifyVaultItemUpdated: notifyVaultItemUpdatedAction,
    notifyMessageScheduled: notifyMessageScheduledAction,
    showFeatureTip,
    
    // Pass through context data
    unreadCount: notificationsContext?.unreadCount || 0,
    hasUnread: notificationsContext?.hasUnread || false,
    fetchNotifications: notificationsContext?.fetchNotifications,
    markAsRead: notificationsContext?.markAsRead,
    markAllAsRead: notificationsContext?.markAllAsRead
  };
}
