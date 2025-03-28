
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { Bell, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function NotificationSettings() {
  const { toast } = useToast();
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    documentUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    executorInvitations: true,
    willtankUpdates: true,
  });
  
  // Toggle notification setting
  const toggleNotification = async (setting: keyof typeof notifications) => {
    try {
      // Create a new notifications object with the toggled value
      const updatedNotifications = {
        ...notifications,
        [setting]: !notifications[setting]
      };
      
      // Update local state
      setNotifications(updatedNotifications);
      
      // In a real app, you would save this to the database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: (await supabase.auth.getUser()).data.user?.id,
          notification_settings: updatedNotifications 
        });
      
      if (error) throw error;
      
      toast({
        title: "Notification Setting Updated",
        description: `${notifications[setting] ? 'Disabled' : 'Enabled'} ${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications.`
      });
    } catch (error) {
      console.error("Error updating notification setting:", error);
      // Revert the change in case of error
      setNotifications(notifications);
      
      toast({
        title: "Update Failed",
        description: "There was an error updating your notification settings.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
        <Bell className="text-willtank-700 mr-2" size={18} />
        <h3 className="font-medium">Notification Preferences</h3>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="font-medium mb-4">Notification Channels</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span>Email Notifications</span>
              </div>
              <Switch 
                checked={notifications.email} 
                onCheckedChange={() => toggleNotification('email')}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4">Notification Types</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium">Document Updates</h5>
                <p className="text-xs text-gray-500">Notifications about changes to your documents</p>
              </div>
              <Switch 
                checked={notifications.documentUpdates} 
                onCheckedChange={() => toggleNotification('documentUpdates')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium">Security Alerts</h5>
                <p className="text-xs text-gray-500">Notifications about security-related events</p>
              </div>
              <Switch 
                checked={notifications.securityAlerts} 
                onCheckedChange={() => toggleNotification('securityAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium">Marketing Emails</h5>
                <p className="text-xs text-gray-500">Promotional emails and offers</p>
              </div>
              <Switch 
                checked={notifications.marketingEmails} 
                onCheckedChange={() => toggleNotification('marketingEmails')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium">Executor Invitations</h5>
                <p className="text-xs text-gray-500">Notifications about executor invitations and responses</p>
              </div>
              <Switch 
                checked={notifications.executorInvitations} 
                onCheckedChange={() => toggleNotification('executorInvitations')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium">WillTank Updates</h5>
                <p className="text-xs text-gray-500">Notifications about new features and updates</p>
              </div>
              <Switch 
                checked={notifications.willtankUpdates} 
                onCheckedChange={() => toggleNotification('willtankUpdates')}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
