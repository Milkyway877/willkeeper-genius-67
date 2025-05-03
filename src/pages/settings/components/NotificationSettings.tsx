
import React from 'react';
import { motion } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, BadgeInfo, Shield, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';
import { 
  createTestNotification, 
  createSecurityNotification, 
  createSuccessNotification,
  createWarningNotification,
  createWillCreatedNotification,
  createBeneficiaryAddedNotification
} from '@/utils/testNotifications';
import { toast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationSettings() {
  const { preferences, loading, updatePreference } = useNotificationPreferences();

  const handleTestNotification = async () => {
    try {
      const result = await createTestNotification();
      if (!result) {
        toast({
          title: "Test notification failed",
          description: "There was an issue creating the test notification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive"
      });
    }
  };

  const handleSecurityNotification = async () => {
    try {
      await createSecurityNotification();
    } catch (error) {
      console.error('Error creating security notification:', error);
      toast({
        title: "Error",
        description: "Failed to send security notification.",
        variant: "destructive"
      });
    }
  };

  const handleSuccessNotification = async () => {
    try {
      await createSuccessNotification();
    } catch (error) {
      console.error('Error creating success notification:', error);
      toast({
        title: "Error",
        description: "Failed to send success notification.",
        variant: "destructive"
      });
    }
  };

  const handleWarningNotification = async () => {
    try {
      await createWarningNotification();
    } catch (error) {
      console.error('Error creating warning notification:', error);
      toast({
        title: "Error",
        description: "Failed to send warning notification.",
        variant: "destructive"
      });
    }
  };

  const handleWillCreatedNotification = async () => {
    try {
      await createWillCreatedNotification();
    } catch (error) {
      console.error('Error creating will created notification:', error);
      toast({
        title: "Error",
        description: "Failed to send will created notification.",
        variant: "destructive"
      });
    }
  };

  const handleBeneficiaryAddedNotification = async () => {
    try {
      await createBeneficiaryAddedNotification();
    } catch (error) {
      console.error('Error creating beneficiary added notification:', error);
      toast({
        title: "Error",
        description: "Failed to send beneficiary added notification.",
        variant: "destructive"
      });
    }
  };

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
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Notification Preferences</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <BadgeInfo className="h-3.5 w-3.5" />
              Test Notifications
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleTestNotification}>
              <Bell className="mr-2 h-4 w-4 text-blue-500" />
              <span>General Info</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSecurityNotification}>
              <Shield className="mr-2 h-4 w-4 text-red-500" />
              <span>Security Alert</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSuccessNotification}>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Success Message</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleWarningNotification}>
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              <span>Warning Message</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleWillCreatedNotification}>
              <Bell className="mr-2 h-4 w-4 text-purple-500" />
              <span>Will Created</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBeneficiaryAddedNotification}>
              <Bell className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Beneficiary Added</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
