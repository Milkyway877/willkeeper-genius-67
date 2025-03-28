
import { supabase } from "@/integrations/supabase/client";
import { getWills, getWillExecutors } from "./willService";
import { getNotifications } from "./notificationService";
import { getUserSecurity } from "./encryptionService";

export interface DashboardSummary {
  willCount: number;
  executorCount: number;
  notificationCount: number;
  securityStatus: string;
}

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  start_date: string;
  end_date?: string;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    // Fetch real data from multiple sources
    const [wills, executors, notifications, security] = await Promise.all([
      getWills(),
      getWillExecutors(),
      getNotifications(),
      getUserSecurity()
    ]);
    
    // Check if security is set up
    let securityStatus = 'Vulnerable';
    if (security) {
      if (security.google_auth_enabled) {
        securityStatus = 'Protected';
      } else if (security.encryption_key) {
        securityStatus = 'Secure';
      }
    }
    
    return {
      willCount: wills.length,
      executorCount: executors.length,
      notificationCount: notifications.filter(n => !n.read).length,
      securityStatus
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return {
      willCount: 0,
      executorCount: 0,
      notificationCount: 0,
      securityStatus: 'Unknown'
    };
  }
};

export const getUserWills = async () => {
  return getWills();
};

export const getUserExecutors = async () => {
  return getWillExecutors();
};

export const getUserNotifications = async () => {
  return getNotifications();
};

export const getUserSubscription = async (): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      console.error('Error fetching user subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    return null;
  }
};
