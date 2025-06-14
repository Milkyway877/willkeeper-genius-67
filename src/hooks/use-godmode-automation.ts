
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GodModeNotification {
  id: string;
  user_id: string;
  action: string;
  details: {
    days_overdue: number;
    urgency_level: string;
    user_reminder_sent: boolean;
    user_email_id?: string;
    contacts_notified: number;
    contact_notifications: Array<{
      contact_name: string;
      contact_email: string;
      contact_type: string;
      email_id?: string;
      success: boolean;
    }>;
    timestamp: string;
  };
  created_at: string;
}

interface AutomationStatus {
  isActive: boolean;
  lastRun?: string;
  nextScheduledRun?: string;
  totalNotificationsSent: number;
  lastNotificationDetails?: GodModeNotification;
}

export function useGodModeAutomation() {
  const { toast } = useToast();
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus>({
    isActive: false,
    totalNotificationsSent: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<GodModeNotification[]>([]);

  // Fetch automation status and recent notifications
  const fetchAutomationData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get recent GODMODE notifications for this user
      const { data: logs, error } = await supabase
        .from('death_verification_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('action', 'godmode_notifications_sent')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching automation data:', error);
        return;
      }

      const godModeNotifications = logs || [];
      setNotifications(godModeNotifications);

      // Calculate status
      const lastNotification = godModeNotifications[0];
      const totalSent = godModeNotifications.reduce(
        (sum, log) => sum + (log.details?.contacts_notified || 0), 
        0
      );

      setAutomationStatus({
        isActive: true, // Always active if system is enabled
        lastRun: lastNotification?.created_at,
        totalNotificationsSent: totalSent,
        lastNotificationDetails: lastNotification
      });

    } catch (error) {
      console.error('Error in fetchAutomationData:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger manual GODMODE scan
  const triggerGodModeScan = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      console.log('🚀 Triggering GODMODE scan...');
      
      const { data, error } = await supabase.functions.invoke('godmode-missed-checkins', {
        body: {
          action: 'process_user',
          userId: session.user.id,
          force: true
        }
      });

      if (error) {
        console.error('GODMODE scan error:', error);
        throw error;
      }

      console.log('✅ GODMODE scan completed:', data);

      // Show toast notification
      if (data.success && data.contactsNotified > 0) {
        toast({
          title: "🚀 GODMODE Activated",
          description: `Sent notifications to ${data.contactsNotified} contacts. Check your email for confirmation.`,
          duration: 5000,
        });
      } else if (data.success) {
        toast({
          title: "✅ GODMODE Scan Complete",
          description: data.message || "No notifications needed at this time.",
          duration: 3000,
        });
      }

      // Refresh data
      await fetchAutomationData();

      return data;
    } catch (error) {
      console.error('Error triggering GODMODE scan:', error);
      toast({
        title: "❌ GODMODE Error",
        description: error instanceof Error ? error.message : "Failed to trigger scan",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  }, [toast, fetchAutomationData]);

  // Trigger system-wide GODMODE scan (admin feature)
  const triggerSystemWideScan = useCallback(async () => {
    try {
      console.log('🌍 Triggering system-wide GODMODE scan...');
      
      const { data, error } = await supabase.functions.invoke('godmode-missed-checkins', {
        body: {
          action: 'auto_scan'
        }
      });

      if (error) {
        console.error('System-wide GODMODE scan error:', error);
        throw error;
      }

      console.log('✅ System-wide GODMODE scan completed:', data);

      toast({
        title: "🌍 System GODMODE Complete",
        description: `Processed ${data.processed || 0} users with missed check-ins.`,
        duration: 5000,
      });

      return data;
    } catch (error) {
      console.error('Error triggering system-wide scan:', error);
      toast({
        title: "❌ System GODMODE Error",
        description: error instanceof Error ? error.message : "Failed to trigger system scan",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  }, [toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchAutomationData();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Subscribe to new GODMODE notifications
    const subscription = supabase
      .channel('godmode_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'death_verification_logs',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('📡 Real-time GODMODE update:', payload);
          
          if (payload.new.action === 'godmode_notifications_sent') {
            // Show real-time toast
            const details = payload.new.details as any;
            toast({
              title: "🚀 GODMODE Activated",
              description: `Automated notifications sent to ${details?.contacts_notified || 0} contacts`,
              duration: 5000,
            });
            
            // Refresh data
            fetchAutomationData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAutomationData, toast]);

  return {
    automationStatus,
    notifications,
    loading,
    triggerGodModeScan,
    triggerSystemWideScan,
    refreshData: fetchAutomationData
  };
}
