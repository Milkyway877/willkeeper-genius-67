
import React from 'react';
import { motion } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { Bell, Mail } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';

export function NotificationSettings() {
  const { preferences, loading, updatePreference } = useNotificationPreferences();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
                checked={preferences.documentUpdates}
                onCheckedChange={(checked) => updatePreference('documentUpdates', checked)}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4">Notification Types</h4>
          <div className="space-y-4">
            {Object.entries({
              securityAlerts: {
                title: 'Security Alerts',
                description: 'Notifications about security-related events'
              },
              documentUpdates: {
                title: 'Document Updates',
                description: 'Notifications about changes to your documents'
              },
              legalChanges: {
                title: 'Legal Changes',
                description: 'Updates about legal changes that may affect your will'
              },
              executorActivities: {
                title: 'Executor Activities',
                description: 'Notifications about executor verification and actions'
              },
              marketingEmails: {
                title: 'Marketing Emails',
                description: 'Promotional emails and offers'
              },
              willtankUpdates: {
                title: 'WillTank Updates',
                description: 'Notifications about new features and updates'
              }
            }).map(([key, { title, description }]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium">{title}</h5>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                <Switch
                  checked={preferences[key as keyof typeof preferences]}
                  onCheckedChange={(checked) => 
                    updatePreference(key as keyof typeof preferences, checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
