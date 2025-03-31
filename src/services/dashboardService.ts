
import { supabase } from "@/integrations/supabase/client";
import { createUserSecurity, getUserSecurity } from "@/services/encryptionService";
import { Notification } from "@/services/notificationService";

export interface DashboardSummary {
  willCount: number;
  executorCount: number;
  notificationCount: number;
  securityStatus: string;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    // Get user session first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    // Initialize results with defaults in case any query fails
    let willsCount = 0;
    let executorsCount = 0;
    let notificationsCount = 0;
    let securityResult = null;
    
    try {
      // Run all queries in parallel with individual error handling
      const [willsResult, executorsResult, notificationsResult] = await Promise.all([
        supabase.from('wills').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('will_executors').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('read', false)
      ]);
      
      // Extract counts, handling potential errors
      willsCount = willsResult.error ? 0 : willsResult.count || 0;
      executorsCount = executorsResult.error ? 0 : executorsResult.count || 0;
      notificationsCount = notificationsResult.error ? 0 : notificationsResult.count || 0;
    } catch (e) {
      console.error('Error fetching dashboard counts:', e);
    }
    
    // Get security info with separate error handling
    try {
      securityResult = await getUserSecurity();
    } catch (e) {
      console.error('Error getting user security:', e);
    }
    
    // If security doesn't exist, try to create it
    if (!securityResult) {
      try {
        await createUserSecurity();
      } catch (e) {
        console.error('Error creating user security:', e);
      }
    }
    
    // Determine security status based on various factors
    let securityStatus = 'Good';
    
    if (!securityResult) {
      securityStatus = 'Needs Setup';
    } else if (!securityResult.encryption_key) {
      securityStatus = 'Incomplete';
    } else if (securityResult.google_auth_enabled) {
      securityStatus = 'Strong';
    }
    
    return {
      willCount: willsCount,
      executorCount: executorsCount,
      notificationCount: notificationsCount,
      securityStatus: securityStatus
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
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user wills:', error);
    return [];
  }
};

export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) throw error;
    
    return data as Notification[] || [];
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
};

export const getUserExecutors = async () => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user executors:', error);
    return [];
  }
};

export const getUserSubscription = async () => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      // If no subscription is found, this is expected
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
};
