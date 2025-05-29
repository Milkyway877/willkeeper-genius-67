
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SimpleNotification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'security';
  read: boolean;
  created_at: string;
}

export function useSimpleNotifications() {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (!error) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        return true;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    return false;
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    fetchNotifications();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchNotifications();
      } else {
        setNotifications([]);
        setLoading(false);
      }
    });

    // Setup realtime for new notifications
    const channel = supabase
      .channel('notifications-simple')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as SimpleNotification;
          setNotifications(prev => [newNotification, ...prev]);
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
          const updatedNotification = payload.new as SimpleNotification;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead
  };
}
