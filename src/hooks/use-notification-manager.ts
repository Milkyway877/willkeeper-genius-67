
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { createSystemNotification } from '@/services/notificationService';
import { useNotificationsContext } from '@/contexts/NotificationsContext';

export type NotificationPriority = 'low' | 'medium' | 'high';

export function useNotificationManager() {
  // Try to use the notifications context if available
  let notificationsContext;
  try {
    notificationsContext = useNotificationsContext();
  } catch (error) {
    console.warn("NotificationsContext not available, some features may be limited");
    notificationsContext = null;
  }

  // Function to generate a reliable notification with both toast and persistent storage
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
      console.log(`Creating ${type} notification: ${title}`);
      return await createSystemNotification(type, { title, description });
    } catch (error) {
      console.error(`Failed to create ${type} notification:`, error);
      return null;
    }
  }, []);

  // Convenience methods for different notification types
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

  // Common actions that should trigger notifications
  const notifyWillCreated = useCallback((willTitle?: string) => {
    return notifySuccess(
      'Will Created', 
      `Your will "${willTitle || 'Untitled'}" has been successfully created.`
    );
  }, [notifySuccess]);

  const notifyWillUpdated = useCallback((willTitle?: string) => {
    return notifySuccess(
      'Will Updated', 
      `Your will "${willTitle || 'Untitled'}" has been successfully updated.`
    );
  }, [notifySuccess]);

  const notifyDocumentUploaded = useCallback((docTitle?: string) => {
    return notifyInfo(
      'Document Uploaded', 
      `"${docTitle || 'Your document'}" has been successfully uploaded.`
    );
  }, [notifyInfo]);

  const notifySubscriptionChanged = useCallback((planName?: string, status?: string) => {
    return notifySuccess(
      'Subscription Updated', 
      `Your subscription ${planName ? `to ${planName}` : ''} is now ${status || 'active'}.`
    );
  }, [notifySuccess]);

  const notifyBeneficiaryAdded = useCallback((name?: string) => {
    return notifyInfo(
      'Beneficiary Added', 
      `${name || 'A new beneficiary'} has been added to your will.`
    );
  }, [notifyInfo]);

  const notifyExecutorAdded = useCallback((name?: string) => {
    return notifyInfo(
      'Executor Added', 
      `${name || 'A new executor'} has been added to your will.`
    );
  }, [notifyInfo]);

  const notifyWelcome = useCallback(() => {
    return notifyInfo(
      'Welcome to WillTank', 
      'Thank you for joining. Get started by creating your first will and securing your legacy.',
      'high'
    );
  }, [notifyInfo]);

  const notifySecurityAlert = useCallback((description: string) => {
    return notifySecurity(
      'Security Alert',
      description
    );
  }, [notifySecurity]);

  return {
    // Generic notification methods
    notify,
    notifySuccess,
    notifyInfo,
    notifyWarning,
    notifySecurity,
    
    // Action-specific notification methods
    notifyWillCreated,
    notifyWillUpdated,
    notifyDocumentUploaded,
    notifySubscriptionChanged,
    notifyBeneficiaryAdded,
    notifyExecutorAdded,
    notifyWelcome,
    notifySecurityAlert,
    
    // Pass through any context data that might be useful
    unreadCount: notificationsContext?.unreadCount || 0,
    hasUnread: notificationsContext?.hasUnread || false,
    fetchNotifications: notificationsContext?.fetchNotifications,
    markAsRead: notificationsContext?.markAsRead,
    markAllAsRead: notificationsContext?.markAllAsRead
  };
}
