
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNotifications, Notification, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  hasUnread: boolean;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      console.log("Fetched notifications:", data);
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      const success = await markNotificationAsRead(id);
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, is_read: true } : notification
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const success = await markAllNotificationsAsRead();
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  };

  // Set up real-time listener for new notifications
  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          // Make sure we validate the type
          const validatedType = validateNotificationType(newNotification.type);
          
          // Add the new notification to the state
          setNotifications(prev => [
            { ...newNotification, type: validatedType },
            ...prev
          ]);
          
          // Show a toast for the new notification
          toast({
            title: newNotification.title,
            description: newNotification.message || '',
            // Map notification types to valid toast variants
            variant: getToastVariant(validatedType)
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification updated:', payload);
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === updatedNotification.id
                ? { ...updatedNotification, type: validateNotificationType(updatedNotification.type) }
                : notification
            )
          );
        }
      )
      .subscribe();

    // Debug to confirm channel is established
    console.log('Realtime channel subscribed:', channel);

    return () => {
      console.log('Cleaning up Supabase channel');
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const hasUnread = unreadCount > 0;

  // Helper function to validate notification types
  function validateNotificationType(type: string): 'success' | 'warning' | 'info' | 'security' {
    const validTypes = ['success', 'warning', 'info', 'security'];
    return validTypes.includes(type) ? type as 'success' | 'warning' | 'info' | 'security' : 'info';
  }
  
  // Helper to determine toast variant based on notification type
  function getToastVariant(type: 'success' | 'warning' | 'info' | 'security'): 'default' | 'destructive' {
    switch (type) {
      case 'warning':
      case 'info':
      case 'success':
        return 'default';
      case 'security':
        return 'destructive';
      default:
        return 'default';
    }
  }

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        hasUnread, 
        loading, 
        error, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
