
import { supabase } from "@/integrations/supabase/client";
import { getUserSecurity, createUserSecurity } from "@/services/encryptionService";

export interface DashboardSummary {
  securityStatus: string;
  activeWills: number;
  messagesInTank: number;
  trustedContacts: number;
  securityScore: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }>;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    const userId = session.user.id;
    
    // Fetch active wills count
    const { count: willsCount } = await supabase
      .from('wills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Fetch messages in tank count
    const { count: messagesCount } = await supabase
      .from('future_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['scheduled', 'processing']);

    // Fetch trusted contacts count
    const { count: contactsCount } = await supabase
      .from('trusted_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'verified');

    // Fetch recent activity (last 5 activities)
    const { data: activityData } = await supabase
      .from('user_activity')
      .select('id, activity_type, activity_description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Format recent activity
    const recentActivity = (activityData || []).map(activity => ({
      id: activity.id,
      type: activity.activity_type || 'general',
      title: activity.activity_description || 'Activity recorded',
      timestamp: activity.created_at
    }));

    // Get security information
    let securityResult = null;
    
    try {
      securityResult = await getUserSecurity();
    } catch (e) {
      console.error('Error getting user security:', e);
    }
    
    if (!securityResult) {
      try {
        await createUserSecurity();
        securityResult = await getUserSecurity();
      } catch (e) {
        console.error('Error creating user security:', e);
      }
    }
    
    // Calculate security score and status
    let securityStatus = 'Good';
    let securityScore = 70; // Base score
    
    if (!securityResult) {
      securityStatus = 'Needs Setup';
      securityScore = 30;
    } else {
      if (securityResult.encryption_key) {
        securityScore += 15;
      }
      if (securityResult.google_auth_enabled) {
        securityScore += 15;
        securityStatus = 'Strong';
      }
      if (!securityResult.encryption_key) {
        securityStatus = 'Incomplete';
        securityScore = 50;
      }
    }
    
    return {
      securityStatus,
      activeWills: willsCount || 0,
      messagesInTank: messagesCount || 0,
      trustedContacts: contactsCount || 0,
      securityScore,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return {
      securityStatus: 'Unknown',
      activeWills: 0,
      messagesInTank: 0,
      trustedContacts: 0,
      securityScore: 0,
      recentActivity: []
    };
  }
};
