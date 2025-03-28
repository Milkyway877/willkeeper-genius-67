
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NotificationSettings() {
  const { toast } = useToast();
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    documentUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    executorInvitations: true,
    willtankUpdates: true,
  });
  
  // Toggle notification setting
  const toggleNotification = (setting: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [setting]: !notifications[setting]
    });
    
    toast({
      title: "Notification Setting Updated",
      description: `${notifications[setting] ? 'Disabled' : 'Enabled'} ${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications.`
    });
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                <span>SMS Notifications</span>
              </div>
              <Switch 
                checked={notifications.sms} 
                onCheckedChange={() => toggleNotification('sms')}
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
