
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Define the Notification type
export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'security';
  read: boolean;
  created_at: string;
  user_id: string;
}

// Define the context type
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  hasUnread: boolean;
  loading: boolean;
  error: Error | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

// Create the context with default values
const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  hasUnread: false,
  loading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => false,
  markAllAsRead: async () => false,
});

// Provider component
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

  // Function to fetch notifications from the API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.warn('User not authenticated, skipping notification fetch');
        setLoading(false);
        return;
      }

      // Fetch notifications from your API or service
      const fetchedNotifications = await fetch(
        '/api/notifications'
      ).then(res => {
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
      });

      // For demonstration, let's create some mock notifications when real ones can't be fetched
      let notificationsData: Notification[] = [];
      try {
        notificationsData = fetchedNotifications;
      } catch (e) {
        // Mock data for development
        notificationsData = [
          {
            id: '1',
            title: 'Account Security',
            description: 'Your password was changed successfully.',
            type: 'success',
            read: false,
            created_at: new Date().toISOString(),
            user_id: session.user.id
          },
          {
            id: '2',
            title: 'Login Attempt',
            description: 'Unusual login attempt detected from a new location.',
            type: 'warning',
            read: false,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user_id: session.user.id
          },
          {
            id: '3',
            title: 'Document Update',
            description: 'Your will document has been updated.',
            type: 'info',
            read: true,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            user_id: session.user.id
          }
        ];
      }

      setNotifications(notificationsData);
      
      // Calculate unread count
      const unread = notificationsData.filter(n => !n.read).length;
      setUnreadCount(unread);
      setHasUnread(unread > 0);
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to mark a notification as read
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Find the notification
      const notification = notifications.find(n => n.id === id);
      if (!notification || notification.read) return true; // Already read or not found
      
      // In a real app, you would call an API to update the notification status
      // await api.updateNotification(id, { read: true });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      
      // Update counts
      setUnreadCount(prev => Math.max(0, prev - 1));
      setHasUnread(unreadCount - 1 > 0);
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [notifications, unreadCount]);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      // In a real app, you would call an API to update all notifications
      // await api.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Update counts
      setUnreadCount(0);
      setHasUnread(false);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  // Fetch notifications when the component mounts and when authentication state changes
  useEffect(() => {
    fetchNotifications();
    
    // Set up subscription to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchNotifications();
      } else if (event === 'SIGNED_OUT') {
        setNotifications([]);
        setUnreadCount(0);
        setHasUnread(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchNotifications]);

  // Subscribe to real-time notifications (if available)
  // This is just a placeholder for real implementation
  useEffect(() => {
    // In a real app, you might set up WebSocket or other real-time subscription
    const interval = setInterval(() => {
      // Periodically check for new notifications if real-time is not available
      fetchNotifications();
    }, 300000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    hasUnread,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom hook to use the notifications context
export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useNotifications = useNotificationsContext;
