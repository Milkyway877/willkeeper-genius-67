
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { createSystemNotification, EventType } from '@/services/notificationService';
import { useNotifications } from '@/contexts/NotificationsContext';

export type NotificationPriority = 'low' | 'medium' | 'high';

export function useNotificationManager() {
  let fetchNotifications;
  
  try {
    // Try to get the fetchNotifications function from the context
    const notificationsContext = useNotifications();
    fetchNotifications = notificationsContext.fetchNotifications;
  } catch (error) {
    // Handle case where context isn't available
    console.warn('NotificationsContext not available:', error);
    fetchNotifications = null;
  }

  const notify = useCallback(async (
    eventType: EventType,
    title: string, 
    description: string,
    priority: NotificationPriority = 'medium'
  ) => {
    // Always show an immediate toast
    toast({
      title,
      description,
      variant: eventType === 'security' || eventType === 'security_key_generated' ? 'destructive' : 'default',
    });
    
    // Don't store low priority notifications
    if (priority === 'low') {
      return null;
    }
    
    // Create a persistent notification
    try {
      const notification = await createSystemNotification(eventType, { title, description });
      // Refresh notifications list if available
      if (fetchNotifications) {
        fetchNotifications();
      }
      return notification;
    } catch (error) {
      console.error(`Failed to create ${eventType} notification:`, error);
      return null;
    }
  }, [fetchNotifications]);

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

  // Add welcome notification helper
  const notifyWelcome = useCallback(() => {
    return notifySuccess(
      'Welcome to WillTank',
      'Your secure digital legacy platform. Get started by exploring the dashboard.'
    );
  }, [notifySuccess]);

  return {
    notify,
    notifySuccess,
    notifyInfo,
    notifyWarning,
    notifySecurity,
    notifyWelcome
  };
}
