
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Clock, 
  Mail, 
  Users, 
  Activity, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Bot,
  Shield,
  Rocket
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useGodModeAutomation } from '@/hooks/use-godmode-automation';

export function GodModeAutomation() {
  const { 
    automationStatus, 
    notifications, 
    loading, 
    triggerGodModeScan,
    refreshData 
  } = useGodModeAutomation();
  
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleManualScan = async () => {
    setScanning(true);
    try {
      await triggerGodModeScan();
    } finally {
      setScanning(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      mild: { variant: 'secondary' as const, icon: '📅' },
      moderate: { variant: 'default' as const, icon: '⚠️' },
      severe: { variant: 'destructive' as const, icon: '🚨' }
    };
    
    const config = variants[urgency as keyof typeof variants] || variants.mild;
    
    return (
      <Badge variant={config.variant} className="ml-2">
        {config.icon} {urgency.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 w-full bg-gray-200 rounded"></div>
            <div className="h-12 w-full bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-willtank-700">
            <Bot className="h-5 w-5 mr-2 text-willtank-600" />
            GODMODE Automation System
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              <Activity className="h-3 w-3 mr-1" />
              ACTIVE
            </Badge>
          </CardTitle>
          <CardDescription>
            Automated missed check-in detection and contact notification system
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-willtank-50 rounded-lg border border-willtank-100">
              <Mail className="h-8 w-8 mx-auto mb-2 text-willtank-600" />
              <div className="text-2xl font-bold text-willtank-800">
                {automationStatus.totalNotificationsSent}
              </div>
              <div className="text-sm text-willtank-600">Total Notifications Sent</div>
            </div>
            
            <div className="text-center p-4 bg-willtank-50 rounded-lg border border-willtank-100">
              <Clock className="h-8 w-8 mx-auto mb-2 text-willtank-600" />
              <div className="text-sm font-medium text-willtank-800">
                {automationStatus.lastRun 
                  ? formatDistanceToNow(parseISO(automationStatus.lastRun), { addSuffix: true })
                  : 'Never'
                }
              </div>
              <div className="text-sm text-willtank-600">Last Automation Run</div>
            </div>
            
            <div className="text-center p-4 bg-willtank-50 rounded-lg border border-willtank-100">
              <Shield className="h-8 w-8 mx-auto mb-2 text-willtank-600" />
              <div className="text-sm font-medium text-willtank-800">
                24/7 Monitoring
              </div>
              <div className="text-sm text-willtank-600">Protection Status</div>
            </div>
          </div>

          <Separator />

          <Alert className="bg-blue-50 border-blue-200">
            <Bot className="h-4 w-4" />
            <AlertTitle>Automated Protection</AlertTitle>
            <AlertDescription>
              GODMODE continuously monitors your check-ins and automatically sends escalating notifications 
              to your contacts when check-ins are missed. No manual intervention required.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button 
              onClick={handleManualScan} 
              disabled={scanning}
              className="flex-1"
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Trigger Manual Scan
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            Recent GODMODE Activities
          </CardTitle>
          <CardDescription>
            Automated notifications sent by the system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="font-medium mb-1">No Automated Activities Yet</h3>
              <p className="text-sm">GODMODE notifications will appear here when check-ins are missed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                      <span className="font-medium">Automated Notifications Sent</span>
                      {getUrgencyBadge(notification.details.urgency_level)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(parseISO(notification.created_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Days Overdue:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {notification.details.days_overdue}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Contacts Notified:</span>
                      <span className="ml-2 font-medium">
                        {notification.details.contacts_notified}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {notification.details.user_reminder_sent ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                          <span className="text-green-600">User Reminded</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
                          <span className="text-red-600">User Not Reminded</span>
                        </>
                      )}
                    </div>
                  </div>

                  {notification.details.contact_notifications && 
                   notification.details.contact_notifications.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="text-xs text-gray-600 mb-2">Contact Notifications:</div>
                      <div className="flex flex-wrap gap-2">
                        {notification.details.contact_notifications.map((contact, idx) => (
                          <Badge 
                            key={idx} 
                            variant={contact.success ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {contact.success ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {contact.contact_name} ({contact.contact_type})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
