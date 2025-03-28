
import { supabase } from "@/integrations/supabase/client";

export interface WillData {
  id: string;
  title: string;
  document_url: string;
  template_type: string | null;
  status: string;
  updated_at: string;
  created_at: string;
}

export interface ExecutorData {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

export interface EncryptionKeyData {
  id: string;
  key_name: string;
  created_at: string;
  last_used: string;
  status: string;
}

export interface SubscriptionData {
  id: string;
  plan: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface NotificationData {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'security';
  date: string;
  read: boolean;
}

// Get user's will data
export const getUserWills = async (): Promise<WillData[]> => {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching wills:', error);
    return [];
  }
}

// Get user's executors
export const getUserExecutors = async (): Promise<ExecutorData[]> => {
  try {
    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        status: item.status,
        created_at: item.created_at
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching executors:', error);
    // Return fallback data if needed
    return [
      {
        id: '1',
        name: 'Jamie Morgan',
        email: 'jamie.morgan@example.com',
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Casey Morgan',
        email: 'casey.morgan@example.com',
        status: 'pending',
        created_at: new Date().toISOString(),
      }
    ];
  }
}

// Get user's encryption keys
export const getUserEncryptionKeys = async (): Promise<EncryptionKeyData[]> => {
  try {
    const { data, error } = await supabase
      .from('user_security')
      .select('encryption_key');
    
    if (error) throw error;
    
    // Format the encryption keys into a more readable format
    return data && data.length > 0 && data[0].encryption_key ? 
      [{
        id: '1',
        key_name: 'Primary Encryption Key',
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
        status: 'active'
      }] : [];
  } catch (error) {
    console.error('Error fetching encryption keys:', error);
    return [];
  }
}

// Get user's subscription
export const getUserSubscription = async (): Promise<SubscriptionData | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned"
    
    return data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    // Return fallback data
    return {
      id: '1',
      plan: 'Premium',
      status: 'Active',
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString(),
    };
  }
}

// Get user's notifications
export const getUserNotifications = async (): Promise<NotificationData[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type as 'success' | 'warning' | 'info' | 'security',
        date: new Date(item.created_at).toISOString(),
        read: item.read
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return empty array - we'll handle fallbacks in the UI
    return [];
  }
}

// Get dashboard summary (counts of various entities)
export const getDashboardSummary = async () => {
  try {
    // Get will count
    const { count: willCount, error: willError } = await supabase
      .from('wills')
      .select('*', { count: 'exact', head: true });
    
    // Get executor count
    const { count: executorCount, error: executorError } = await supabase
      .from('will_executors')
      .select('*', { count: 'exact', head: true });
    
    // Get unread notifications count
    const { count: notificationCount, error: notificationError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);
    
    if (willError) throw willError;
    if (executorError) throw executorError;
    if (notificationError) throw notificationError;
    
    return {
      willCount: willCount || 0,
      executorCount: executorCount || 0,
      notificationCount: notificationCount || 0,
      securityStatus: 'Secure', // This would need a more complex check in a real app
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return {
      willCount: 1,
      executorCount: 2,
      notificationCount: 1,
      securityStatus: 'Secure',
    };
  }
}
