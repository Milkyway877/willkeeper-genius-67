
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getNotifications, Notification, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Debounce helper function
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

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

interface SubscriptionState {
  status: 'idle' | 'subscribing' | 'subscribed' | 'error';
  retryCount: number;
  channel: RealtimeChannel | null;
}

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use a ref for subscription state to avoid re-renders and race conditions
  const subscriptionRef = useRef<SubscriptionState>({
    status: 'idle',
    retryCount: 0,
    channel: null
  });
  
  // Ref to track mounted state to avoid state updates after unmount
  const isMountedRef = useRef(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMountedRef.current) {
          setIsAuthenticated(!!data.session);
          console.log('Auth status checked:', !!data.session);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        if (isMountedRef.current) {
          setIsAuthenticated(false);
        }
      }
    };
    
    checkAuth();
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      console.log('Not authenticated, skipping notification fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching notifications...');
      const data = await getNotifications();
      console.log(`Fetched ${data.length} notifications`);
      
      if (isMountedRef.current) {
        setNotifications(data);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (isMountedRef.current) {
        setError('Failed to load notifications');
        setLoading(false);
      }
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

  // Cleanup function for subscription
  const cleanupSubscription = () => {
    if (subscriptionRef.current.channel) {
      console.log('Cleaning up notification subscription');
      try {
        supabase.removeChannel(subscriptionRef.current.channel);
      } catch (err) {
        console.error('Error removing channel:', err);
      }
      
      subscriptionRef.current = {
        status: 'idle',
        retryCount: 0,
        channel: null
      };
    }
  };

  // Setup Realtime subscription with exponential backoff retry
  const setupRealtimeSubscription = async () => {
    // Skip if already subscribing or subscribed
    if (['subscribing', 'subscribed'].includes(subscriptionRef.current.status)) {
      return;
    }
    
    // Skip if not authenticated
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      console.warn('No authenticated user found for realtime notifications');
      return;
    }

    try {
      const userId = data.session.user.id;
      subscriptionRef.current.status = 'subscribing';
      
      // Cleanup any existing subscription before creating a new one
      cleanupSubscription();
      
      console.log('Setting up realtime subscription for notifications...');
      
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Received new notification via realtime:', payload);
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
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Received notification update via realtime:', payload);
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
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to notifications');
            subscriptionRef.current.status = 'subscribed';
            subscriptionRef.current.channel = channel;
            subscriptionRef.current.retryCount = 0; // Reset retry count on success
          } else if (status === 'TIMED_OUT' || status === 'CLOSED' || err) {
            console.error(`Failed to subscribe to notifications: ${status}`, err);
            subscriptionRef.current.status = 'error';
            
            // Implement exponential backoff for retries
            const retryDelay = Math.min(1000 * (2 ** subscriptionRef.current.retryCount), 30000);
            subscriptionRef.current.retryCount++;
            
            console.log(`Retrying subscription in ${retryDelay}ms (attempt ${subscriptionRef.current.retryCount})`);
            setTimeout(() => {
              if (isMountedRef.current) {
                setupRealtimeSubscription();
              }
            }, retryDelay);
          }
        });
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      subscriptionRef.current.status = 'error';
    }
  };

  // Use debouncedSetup to prevent rapid subscription attempts
  const debouncedSetup = debounce(setupRealtimeSubscription, 500);

  // Set up real-time listener for new notifications
  useEffect(() => {
    // Skip setup if not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    // Initial fetch
    fetchNotifications();

    // Setup subscription
    debouncedSetup();

    // Cleanup function
    return () => {
      cleanupSubscription();
    };
  }, [isAuthenticated]);

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
