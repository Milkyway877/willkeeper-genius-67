import { supabase } from '@/integrations/supabase/client';

export interface MonitoringStatus {
  willId: string;
  status: 'active' | 'grace_period' | 'deletion_pending' | 'deleted';
  timeRemaining: number;
  scheduledDeletion: Date | null;
  notificationsSent: number;
}

export const initializeWillMonitoring = async (willId: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    // Check if monitoring already exists
    const { data: existing } = await supabase
      .from('will_monitoring')
      .select('id')
      .eq('will_id', willId)
      .single();

    if (existing) return true;

    // Create monitoring record
    const { error } = await supabase
      .from('will_monitoring')
      .insert({
        user_id: session.user.id,
        will_id: willId,
        monitoring_status: 'active',
        notifications_sent: 0
      });

    return !error;
  } catch (error) {
    console.error('Error initializing will monitoring:', error);
    return false;
  }
};

export const getMonitoringStatus = async (willId: string): Promise<MonitoringStatus | null> => {
  try {
    const { data, error } = await supabase
      .from('will_monitoring')
      .select(`
        monitoring_status,
        scheduled_deletion,
        notifications_sent,
        wills!inner(subscription_required_after)
      `)
      .eq('will_id', willId)
      .single();

    if (error || !data) return null;

    // Access the first element of the wills array since it's a relationship
    const subscriptionDeadline = new Date(data.wills[0].subscription_required_after);
    const now = new Date();
    const timeRemaining = Math.max(0, subscriptionDeadline.getTime() - now.getTime());

    return {
      willId,
      status: data.monitoring_status as any,
      timeRemaining,
      scheduledDeletion: data.scheduled_deletion ? new Date(data.scheduled_deletion) : null,
      notificationsSent: data.notifications_sent
    };
  } catch (error) {
    console.error('Error getting monitoring status:', error);
    return null;
  }
};

export const cancelWillDeletion = async (willId: string): Promise<boolean> => {
  try {
    // This would typically be called after successful subscription
    const { error: willError } = await supabase
      .from('wills')
      .update({ 
        deletion_scheduled: false,
        deletion_notified: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', willId);

    const { error: monitoringError } = await supabase
      .from('will_monitoring')
      .update({
        monitoring_status: 'active',
        scheduled_deletion: null,
        updated_at: new Date().toISOString()
      })
      .eq('will_id', willId);

    return !willError && !monitoringError;
  } catch (error) {
    console.error('Error canceling will deletion:', error);
    return false;
  }
};

export const triggerGodmodeCheck = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('monitor-subscriptions');
    return !error;
  } catch (error) {
    console.error('Error triggering GODMODE check:', error);
    return false;
  }
};
