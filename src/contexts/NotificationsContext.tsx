
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
            notification.id === id ? { ...notification, read: true } : notification
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
          prev.map(notification => ({ ...notification, read: true }))
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

    // Get the current user's session
    const getUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    };

    // Set up real-time subscription for notifications
    const setupRealtimeSubscription = async () => {
      const session = await getUserSession();
      
      if (!session?.user) {
        console.warn('No authenticated user found for realtime notifications');
        return;
      }

      const channel = supabase
        .channel('notifications-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            
            // Add to our state
            setNotifications(prev => [newNotification, ...prev]);
            
            // Show a toast
            toast({
              title: newNotification.title,
              description: newNotification.description,
              variant: newNotification.type === 'security' ? 'destructive' : 'default',
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            const updatedNotification = payload.new as Notification;
            
            // Update in our state
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === updatedNotification.id ? updatedNotification : notification
              )
            );
          }
        )
        .subscribe((status, err) => {
          if (status !== 'SUBSCRIBED') {
            console.error('Failed to subscribe to notifications:', status, err);
          } else {
            console.log('Successfully subscribed to notifications');
          }
        });

      // Return cleanup function
      return () => {
        supabase.removeChannel(channel);
      };
    };

    // Set up the subscription
    const cleanup = setupRealtimeSubscription();
    
    // Clean up on component unmount
    return () => {
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

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
