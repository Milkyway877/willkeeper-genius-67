
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, BadgeInfo, Shield, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';
import { 
  createTestNotification, 
  createSecurityNotification, 
  createSuccessNotification,
  createWarningNotification,
  createWillCreatedNotification,
  createBeneficiaryAddedNotification,
  createMultipleNotifications
} from '@/utils/testNotifications';
import { toast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function NotificationSettings() {
  const { notificationSettings, loading, updatePreferences } = useNotificationPreferences();

  const handlePreferenceUpdate = (key: keyof typeof notificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    updatePreferences(newSettings);
  };

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
                checked={notificationSettings.email}
                onCheckedChange={(checked) => handlePreferenceUpdate('email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-3" />
                <span>App Notifications</span>
              </div>
              <Switch
                checked={notificationSettings.app}
                onCheckedChange={(checked) => handlePreferenceUpdate('app', checked)}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4">Notification Types</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium">Marketing Emails</h5>
                <p className="text-xs text-gray-500">Promotional emails and offers</p>
              </div>
              <Switch
                checked={notificationSettings.marketing}
                onCheckedChange={(checked) => handlePreferenceUpdate('marketing', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
