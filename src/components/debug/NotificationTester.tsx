
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, CheckCircle, AlertTriangle, Info, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createSystemNotification } from '@/services/notificationService';

export function NotificationTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_notification_system_health');
      
      if (error) {
        throw error;
      }
      
      setHealthCheck(data);
      setLastResult('Health check completed');
      
      if (data.status === 'success') {
        toast.success('Notification System Health Check Passed');
      } else {
        toast.error('Notification System Health Check Failed');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setLastResult(`Health check failed: ${error.message}`);
      toast.error('Health check failed');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestNotification = async (type: 'info' | 'success' | 'warning' | 'security') => {
    setIsLoading(true);
    try {
      const titles = {
        info: 'Test Info Notification',
        success: 'Test Success Notification', 
        warning: 'Test Warning Notification',
        security: 'Test Security Notification'
      };
      
      const descriptions = {
        info: 'This is a test info notification created for debugging.',
        success: 'This is a test success notification created for debugging.',
        warning: 'This is a test warning notification created for debugging.',
        security: 'This is a test security notification created for debugging.'
      };

      const notification = await createSystemNotification(type, {
        title: titles[type],
        description: descriptions[type]
      });

      if (notification) {
        setLastResult(`Created ${type} notification: ${notification.id}`);
        toast.success(`${type} notification created successfully`);
      } else {
        throw new Error('Failed to create notification');
      }
    } catch (error) {
      console.error(`Failed to create ${type} notification:`, error);
      setLastResult(`Failed to create ${type} notification: ${error.message}`);
      toast.error(`Failed to create ${type} notification`);
    } finally {
      setIsLoading(false);
    }
  };

  const createRPCTestNotification = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_test_notification');
      
      if (error) {
        throw error;
      }
      
      setLastResult(`Created test notification via RPC: ${data}`);
      toast.success('RPC test notification created successfully');
    } catch (error) {
      console.error('RPC test failed:', error);
      setLastResult(`RPC test failed: ${error.message}`);
      toast.error('RPC test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System Tester
        </CardTitle>
        <CardDescription>
          Debug and test the notification system functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Check Section */}
        <div className="space-y-2">
          <Button 
            onClick={runHealthCheck} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Run System Health Check
          </Button>
          
          {healthCheck && (
            <Alert>
              <div className="flex items-center gap-2">
                {getStatusIcon(healthCheck.status)}
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant={healthCheck.status === 'success' ? 'default' : 'destructive'}>
                        {healthCheck.status}
                      </Badge>
                    </div>
                    <div><strong>Message:</strong> {healthCheck.message}</div>
                    {healthCheck.user_id && (
                      <div><strong>User ID:</strong> {healthCheck.user_id}</div>
                    )}
                    {healthCheck.existing_notifications !== undefined && (
                      <div><strong>Existing Notifications:</strong> {healthCheck.existing_notifications}</div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        {/* Test Notification Buttons */}
        <div className="space-y-2">
          <h4 className="font-medium">Create Test Notifications</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => createTestNotification('info')} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Info className="h-4 w-4 mr-1" />
              Info
            </Button>
            <Button 
              onClick={() => createTestNotification('success')} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Success
            </Button>
            <Button 
              onClick={() => createTestNotification('warning')} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Warning
            </Button>
            <Button 
              onClick={() => createTestNotification('security')} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-1" />
              Security
            </Button>
          </div>
          
          <Button 
            onClick={createRPCTestNotification} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test RPC Function
          </Button>
        </div>

        {/* Last Result */}
        {lastResult && (
          <Alert>
            <AlertDescription>
              <strong>Last Result:</strong> {lastResult}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
