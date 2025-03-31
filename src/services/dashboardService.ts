
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from './userService';

export async function getProfile() {
  return await getUserProfile();
}

export async function getDashboardSummary() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return null;
    }

    // Get counts of various items
    const [wills, vault, messages, executors] = await Promise.all([
      supabase.from('wills').select('id', { count: 'exact' }).eq('user_id', userData.user.id),
      supabase.from('legacy_vault').select('id', { count: 'exact' }).eq('user_id', userData.user.id),
      supabase.from('future_messages').select('id', { count: 'exact' }).eq('user_id', userData.user.id),
      supabase.from('will_executors').select('id', { count: 'exact' }).eq('user_id', userData.user.id)
    ]);

    return {
      wills: wills.count || 0,
      vaultItems: vault.count || 0,
      messages: messages.count || 0,
      executors: executors.count || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return null;
  }
}

export async function getUserNotifications() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return [];
    }

    // Placeholder for real notifications
    // In a real implementation, you would fetch from a notifications table
    return [
      {
        id: '1',
        title: 'Welcome to Skyler',
        description: 'Thank you for joining our platform. Get started by creating your first will.',
        date: new Date().toISOString(),
        read: false
      }
    ];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function getUserWills() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user wills:', error);
    return [];
  }
}

export async function getUserExecutors() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user executors:', error);
    return [];
  }
}

export async function getUserSubscription() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'Active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return {
          plan: 'free',
          start_date: new Date().toISOString(),
          status: 'Active'
        };
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}
