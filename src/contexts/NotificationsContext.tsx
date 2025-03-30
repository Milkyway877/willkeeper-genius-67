
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, createSystemNotification, Notification } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  createNotification: (type: string, details: { title: string, description: string }) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: async () => {},
  createNotification: async () => {},
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Set up a polling interval to refresh notifications every minute
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // every minute
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const success = await markNotificationAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      if (success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (type: string, details: { title: string, description: string }) => {
    try {
      const notification = await createSystemNotification(type, details);
      if (notification) {
        setNotifications(prev => [notification, ...prev]);
        
        // Show a toast with the notification
        toast({
          title: details.title,
          description: details.description,
          variant: notification.type === 'warning' ? 'destructive' : 'default',
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount: notifications.filter(n => !n.read).length,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
        createNotification
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
