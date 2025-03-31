
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
  read: boolean;
  icon?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user);
        
        if (data.user) {
          fetchNotifications();
        } else {
          setLoading(false);
          console.log("User not authenticated, skipping notification fetch");
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchNotifications();
      } else {
        // Clear notifications when user logs out
        setNotifications([]);
        setUnreadCount(0);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        const newNotification = payload.new as Notification;
        
        // Check if this notification is for the current user
        supabase.auth.getUser().then(({ data }) => {
          if (data.user && newNotification.user_id === data.user.id) {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show a toast for the new notification
            toast({
              title: newNotification.title,
              description: newNotification.description,
            });
          }
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      // Check if user is authenticated before fetching
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn("User not authenticated, cannot fetch notifications");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
        
      if (error) throw error;
      
      if (data) {
        setNotifications(data);
        const unread = data.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Check auth first
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn("User not authenticated, cannot mark notifications as read");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      
      // Update unread count
      const updatedUnreadCount = notifications.filter(n => !n.read && n.id !== id).length;
      setUnreadCount(updatedUnreadCount);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Check auth first
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn("User not authenticated, cannot mark all notifications as read");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userData.user.id)
        .eq('read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    try {
      // Check auth first
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn("User not authenticated, cannot add notification");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .insert([
          {
            ...notification,
            user_id: userData.user.id,
            read: false
          }
        ]);
        
      if (error) throw error;
      
      // The real-time subscription will update the notifications list
      
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      addNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
}
