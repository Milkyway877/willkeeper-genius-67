import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Bell, Eye, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useSimpleNotifications } from '@/hooks/useSimpleNotifications';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface NotificationPreferences {
  securityAlerts: boolean;
  documentUpdates: boolean;
  legalChanges: boolean;
  executorActivities: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="text-green-600" size={20} />;
    case 'warning':
      return <AlertTriangle className="text-amber-600" size={20} />;
    case 'security':
      return <Shield className="text-red-600" size={20} />;
    case 'info':
    default:
      return <Bell className="text-blue-600" size={20} />;
  }
};

export default function Notifications() {
  const { notifications, unreadCount, loading, markAsRead } = useSimpleNotifications();
  
  const [preferences, setPreferences] = useLocalStorage<NotificationPreferences>('notification-preferences', {
    securityAlerts: true,
    documentUpdates: true,
    legalChanges: true,
    executorActivities: true
  });
  
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    setIsLoadingPreferences(true);
    
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      setPreferences(updatedPreferences);
      
      toast.success("Preferences updated", {
        description: `Your notification preferences have been updated.`,
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      setPreferences(preferences);
      
      toast.error("Error updating preferences", {
        description: "An error occurred while updating your preferences. Please try again.",
      });
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const success = await markAsRead(id);
      
      if (success) {
        toast.success("Notification marked as read", {
          description: "The notification has been marked as read."
        });
      } else {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error("Error", {
        description: "Failed to mark notification as read. Please try again."
      });
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

  if (loading) {
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
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
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
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-3">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleMarkAsRead(notification.id)}
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
            ))
          ) : (
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
                <Switch 
                  checked={preferences.securityAlerts} 
                  disabled={isLoadingPreferences}
                  onCheckedChange={(checked) => updatePreference('securityAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Document Updates</p>
                  <p className="text-sm text-gray-500">Notifications when your will or documents are updated</p>
                </div>
                <Switch 
                  checked={preferences.documentUpdates} 
                  disabled={isLoadingPreferences}
                  onCheckedChange={(checked) => updatePreference('documentUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Legal Changes</p>
                  <p className="text-sm text-gray-500">Updates about legal changes that may affect your will</p>
                </div>
                <Switch 
                  checked={preferences.legalChanges} 
                  disabled={isLoadingPreferences}
                  onCheckedChange={(checked) => updatePreference('legalChanges', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-1">Executor Activities</p>
                  <p className="text-sm text-gray-500">Notifications about executor verification and actions</p>
                </div>
                <Switch 
                  checked={preferences.executorActivities} 
                  disabled={isLoadingPreferences}
                  onCheckedChange={(checked) => updatePreference('executorActivities', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
