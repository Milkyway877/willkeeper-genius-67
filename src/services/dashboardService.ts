
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
    
    // Run all queries in parallel
    const [willsResult, executorsResult, notificationsResult, securityResult] = await Promise.all([
      supabase.from('wills').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
      supabase.from('will_executors').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('read', false),
      getUserSecurity()
    ]);
    
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
      willCount: willsResult.count || 0,
      executorCount: executorsResult.count || 0,
      notificationCount: notificationsResult.count || 0,
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
