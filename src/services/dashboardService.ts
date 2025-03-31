
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from './profileService';

export interface DashboardStats {
  willsCount: number;
  documentsCount: number;
  messagesCount: number;
  executorsCount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const userId = userData.user.id;

    // Get count of wills
    const { count: willsCount, error: willsError } = await supabase
      .from('wills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (willsError) throw willsError;

    // Get count of vault documents
    const { count: documentsCount, error: docsError } = await supabase
      .from('legacy_vault')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (docsError) throw docsError;

    // Get count of future messages
    const { count: messagesCount, error: messagesError } = await supabase
      .from('future_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (messagesError) throw messagesError;

    // Get count of executors
    const { count: executorsCount, error: executorsError } = await supabase
      .from('will_executors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (executorsError) throw executorsError;

    return {
      willsCount: willsCount || 0,
      documentsCount: documentsCount || 0,
      messagesCount: messagesCount || 0,
      executorsCount: executorsCount || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export async function getUserActivity(limit: number = 5) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
}

export async function logActivity(action: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert([
        {
          user_id: userData.user.id,
          action,
          timestamp: new Date(),
        },
      ]);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
}

// Add these exports for Dashboard.tsx that's trying to import them
export const getDashboardSummary = getDashboardStats;
export const getUserNotifications = () => [];
export const getUserWills = () => [];
export const getUserExecutors = () => [];
export const getUserSubscription = () => null;
