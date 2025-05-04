
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BellRing, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { testAllNotificationChannels, createTestNotification, createSecurityNotification, createSuccessNotification, createWarningNotification, createCheckInCompletedNotification, createCheckInMissedNotification, createCheckInScheduledNotification } from '@/utils/testNotifications';

export function NotificationTestButton() {
  const [loading, setLoading] = useState(false);
  
  const handleTestNotification = async (type: string) => {
    setLoading(true);
    
    try {
      switch (type) {
        case 'all':
          await testAllNotificationChannels();
          break;
        case 'test':
          await createTestNotification();
          break;
        case 'security':
          await createSecurityNotification();
          break;
        case 'success':
          await createSuccessNotification();
          break;
        case 'warning':
          await createWarningNotification();
          break;
        case 'check-in-completed':
          await createCheckInCompletedNotification();
          break;
        case 'check-in-missed':
          await createCheckInMissedNotification();
          break;
        case 'check-in-scheduled':
          await createCheckInScheduledNotification();
          break;
      }
    } catch (error) {
      console.error('Error testing notification:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <BellRing className="h-4 w-4" />
          Test Notifications
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Test Notification System</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleTestNotification('all')} disabled={loading}>
          <Shield className="mr-2 h-4 w-4" />
          Test All Channels
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleTestNotification('test')} disabled={loading}>
          <BellRing className="mr-2 h-4 w-4 text-blue-500" />
          General Info
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTestNotification('success')} disabled={loading}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Success Message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTestNotification('warning')} disabled={loading}>
          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
          Warning Message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTestNotification('security')} disabled={loading}>
          <Shield className="mr-2 h-4 w-4 text-red-500" />
          Security Alert
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Check-In Notifications</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleTestNotification('check-in-completed')} disabled={loading}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Check-In Completed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTestNotification('check-in-missed')} disabled={loading}>
          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
          Check-In Missed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTestNotification('check-in-scheduled')} disabled={loading}>
          <BellRing className="mr-2 h-4 w-4 text-blue-500" />
          Check-In Scheduled
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
