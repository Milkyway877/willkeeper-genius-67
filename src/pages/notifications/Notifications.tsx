
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Bell, Eye, FileText, Shield, Users, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

type Notification = {
  id: number | string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'success' | 'warning' | 'info' | 'security';
  date: string;
  read: boolean;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Check if notifications table exists by querying it
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error && error.code !== 'PGRST116') {
          // Real error
          throw error;
        }
        
        // If we got data, format it for display
        if (data && data.length > 0) {
          const formattedNotifications = data.map(item => {
            let icon;
            switch (item.type) {
              case 'success':
                icon = <CheckCircle className="text-green-600" size={20} />;
                break;
              case 'warning':
                icon = <AlertTriangle className="text-amber-600" size={20} />;
                break;
              case 'security':
                icon = <Shield className="text-red-600" size={20} />;
                break;
              default:
                icon = <Bell className="text-blue-600" size={20} />;
                break;
            }
            
            return {
              id: item.id,
              title: item.title,
              description: item.description,
              icon,
              type: item.type,
              date: new Date(item.created_at).toLocaleDateString(),
              read: item.read
            };
          });
          
          setNotifications(formattedNotifications);
        } else {
          // No data, use sample notifications
          setNotifications([
            {
              id: 1,
              title: "Will Updated Successfully",
              description: "Your will document was successfully updated and encrypted.",
              icon: <FileText className="text-green-600" size={20} />,
              type: "success",
              date: "2 hours ago",
              read: false
            },
            {
              id: 2,
              title: "Security Alert: New Login",
              description: "A new login to your account was detected from a new device in Boston.",
              icon: <Shield className="text-amber-600" size={20} />,
              type: "security",
              date: "Yesterday",
              read: false
            },
            {
              id: 3,
              title: "Executor Invitation Accepted",
              description: "Casey Morgan has accepted your invitation to be an executor.",
              icon: <Users className="text-blue-600" size={20} />,
              type: "info",
              date: "2 days ago",
              read: true
            },
            {
              id: 4,
              title: "Legal Update: Trust Law Changes",
              description: "Recent changes to trust laws in your state may affect your estate planning.",
              icon: <AlertTriangle className="text-amber-600" size={20} />,
              type: "warning",
              date: "1 week ago",
              read: true
            },
            {
              id: 5,
              title: "ID Verification Completed",
              description: "Your identity verification has been successfully completed.",
              icon: <CheckCircle className="text-green-600" size={20} />,
              type: "success",
              date: "2 weeks ago",
              read: true
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: "Error loading notifications",
          description: "Could not load your notifications. Please try again later.",
          variant: "destructive"
        });
        
        // Set fallback notifications
        setNotifications([
          {
            id: 1,
            title: "Welcome to WillTank",
            description: "Thank you for joining WillTank. Get started by creating your first will.",
            icon: <CheckCircle className="text-green-600" size={20} />,
            type: "success",
            date: "Just now",
            read: false
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [toast]);

  const markAsRead = async (id: number | string) => {
    try {
      // Update in the database if it exists
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read."
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Still update the UI even if the database update fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update in the database if it exists
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read."
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Still update the UI even if the database update fails
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'info': return 'bg-blue-50 border-blue-100';
      case 'security': return 'bg-red-50 border-red-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications & Updates</h1>
              <p className="text-gray-600">Stay informed about your account, security, and legal updates.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-willtank-600 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications & Updates</h1>
            <p className="text-gray-600">Stay informed about your account, security, and legal updates.</p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {notifications.map((notification, index) => (
            <motion.div 
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-6 rounded-xl border ${notification.read ? 'bg-white border-gray-200' : `${getTypeStyles(notification.type)} shadow-sm`} flex`}
            >
              <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${
                notification.read ? 'bg-gray-100' : getTypeStyles(notification.type)
              }`}>
                {notification.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-3">
                      {notification.date}
                    </span>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Eye size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{notification.description}</p>
                
                {!notification.read && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {notifications.length === 0 && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center">
              <Bell size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-gray-500">You don't have any notifications at the moment.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Security Alerts</p>
                  <p className="text-sm text-gray-500">Get notified about login attempts and security issues</p>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Document Updates</p>
                  <p className="text-sm text-gray-500">Notifications when your will or documents are updated</p>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Legal Changes</p>
                  <p className="text-sm text-gray-500">Updates about legal changes that may affect your will</p>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Executor Activities</p>
                  <p className="text-sm text-gray-500">Notifications about executor verification and actions</p>
                </div>
                <Switch checked={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
