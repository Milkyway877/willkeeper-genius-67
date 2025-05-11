import { supabase } from '@/integrations/supabase/client';
import { notifyAllTrustedContacts } from './trustedContactsService';

export interface DeathVerificationSettings {
  id?: string;
  user_id?: string;
  check_in_enabled: boolean;
  check_in_frequency: number; // days
  grace_period: number; // days
  beneficiary_verification_interval: number; // hours
  reminder_frequency: number; // hours
  pin_system_enabled: boolean;
  executor_override_enabled: boolean;
  trusted_contact_enabled: boolean;
  trusted_contact_email?: string; // Add this field to fix the error
  failsafe_enabled: boolean;
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface DeathVerificationCheckin {
  id: string;
  user_id: string;
  status: string;
  checked_in_at: string;
  next_check_in: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Default settings values
export const DEFAULT_SETTINGS: DeathVerificationSettings = {
  check_in_enabled: false,
  check_in_frequency: 30,
  grace_period: 7,
  beneficiary_verification_interval: 48,
  reminder_frequency: 24,
  pin_system_enabled: true,
  executor_override_enabled: true,
  trusted_contact_enabled: true,
  failsafe_enabled: true,
  notification_preferences: {
    email: true,
    push: true
  }
};

export const getDeathVerificationSettings = async (): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return default settings
        return DEFAULT_SETTINGS;
      }
      console.error('Error fetching death verification settings:', error);
      return null;
    }
    
    return data || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error in getDeathVerificationSettings:', error);
    return null;
  }
};

export const saveDeathVerificationSettings = async (settings: DeathVerificationSettings): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    // Check if settings already exist for this user
    const { data: existingSettings } = await supabase
      .from('death_verification_settings')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('death_verification_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating death verification settings:', error);
        return null;
      }
      
      return data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('death_verification_settings')
        .insert({
          ...settings,
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting death verification settings:', error);
        return null;
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error in saveDeathVerificationSettings:', error);
    return null;
  }
};

export const createInitialCheckin = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    // Get the user's settings to determine check-in frequency
    const settings = await getDeathVerificationSettings();
    if (!settings) {
      console.error('Failed to get death verification settings');
      return null;
    }
    
    // Calculate next check-in date based on settings
    const now = new Date();
    const nextCheckIn = new Date();
    nextCheckIn.setDate(now.getDate() + settings.check_in_frequency);
    
    // Create the check-in record - Changed 'active' to 'alive'
    const { data, error } = await supabase
      .from('death_verification_checkins')
      .insert({
        user_id: session.user.id,
        status: 'alive',
        checked_in_at: now.toISOString(),
        next_check_in: nextCheckIn.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating initial check-in:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createInitialCheckin:', error);
    return null;
  }
};

export const getLatestCheckin = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const { data, error } = await supabase
      .from('death_verification_checkins')
      .select('*')
      .eq('user_id', session.user.id)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No check-in found
        return null;
      }
      console.error('Error fetching latest check-in:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getLatestCheckin:', error);
    return null;
  }
};

export const performCheckin = async (notes?: string): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    // Get the user's settings to determine check-in frequency
    const settings = await getDeathVerificationSettings();
    if (!settings) {
      console.error('Failed to get death verification settings');
      return null;
    }
    
    // Calculate next check-in date based on settings
    const now = new Date();
    const nextCheckIn = new Date();
    nextCheckIn.setDate(now.getDate() + settings.check_in_frequency);
    
    // Create the check-in record
    const { data, error } = await supabase
      .from('death_verification_checkins')
      .insert({
        user_id: session.user.id,
        status: 'alive',
        checked_in_at: now.toISOString(),
        next_check_in: nextCheckIn.toISOString(),
        notes: notes
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error performing check-in:', error);
      return null;
    }
    
    // Log the check-in
    await supabase.from('death_verification_logs').insert({
      user_id: session.user.id,
      action: 'checkin_performed',
      details: {
        checkin_id: data.id,
        next_check_in: nextCheckIn.toISOString()
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error in performCheckin:', error);
    return null;
  }
};

export const sendStatusCheck = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Call the edge function to send status check emails
    const response = await fetch(`${window.location.origin}/functions/v1/send-status-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: session.user.id
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from status check edge function:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in sendStatusCheck:', error);
    return false;
  }
};

/**
 * Check if a user has missed their check-in and notify trusted contacts if needed
 */
export const checkMissedCheckins = async (): Promise<{
  missed: boolean;
  daysOverdue?: number;
  notificationSent?: boolean;
}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return { missed: false };
    }
    
    // Get latest check-in
    const latestCheckin = await getLatestCheckin();
    
    if (!latestCheckin) {
      // No check-ins yet, nothing to check
      return { missed: false };
    }
    
    // Get settings
    const settings = await getDeathVerificationSettings();
    if (!settings || !settings.check_in_enabled) {
      // Check-ins not enabled
      return { missed: false };
    }
    
    const now = new Date();
    const nextCheckInDate = new Date(latestCheckin.next_check_in);
    const gracePeriodDays = settings.grace_period || 7;
    
    // Add grace period to next check-in date
    const finalDeadline = new Date(nextCheckInDate);
    finalDeadline.setDate(finalDeadline.getDate() + gracePeriodDays);
    
    if (now <= finalDeadline) {
      // Not overdue yet
      return { missed: false };
    }
    
    // Check-in is missed
    const daysOverdue = Math.floor((now.getTime() - finalDeadline.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if we've already notified for this missed check-in
    const { data: notificationLogs } = await supabase
      .from('death_verification_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('action', 'missed_checkin_notification_sent')
      .gte('created_at', nextCheckInDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (notificationLogs && notificationLogs.length > 0) {
      // Already sent notification for this missed check-in
      return { 
        missed: true, 
        daysOverdue,
        notificationSent: true 
      };
    }
    
    // Need to send notifications - first get executor information
    const { data: executor } = await supabase
      .from('executors')
      .select('name, email, phone')
      .eq('user_id', session.user.id)
      .single();
      
    if (!executor) {
      console.error('No executor found for user');
      // Log this issue
      await supabase.from('death_verification_logs').insert({
        user_id: session.user.id,
        action: 'missed_checkin_no_executor',
        details: {
          checked_in_at: latestCheckin.checked_in_at,
          next_check_in: latestCheckin.next_check_in,
          days_overdue: daysOverdue
        }
      });
      
      return { 
        missed: true, 
        daysOverdue,
        notificationSent: false 
      };
    }
    
    // Format the missed since date
    const missedSinceDate = new Date(latestCheckin.next_check_in);
    const missedSince = missedSinceDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Notify trusted contacts
    const notificationResult = await notifyAllTrustedContacts(
      missedSince,
      {
        name: executor.name,
        email: executor.email,
        phone: executor.phone
      }
    );
    
    // Log the notification attempt regardless of success
    await supabase.from('death_verification_logs').insert({
      user_id: session.user.id,
      action: 'missed_checkin_notifications_attempted',
      details: {
        checked_in_at: latestCheckin.checked_in_at,
        next_check_in: latestCheckin.next_check_in,
        days_overdue: daysOverdue,
        notification_success: notificationResult.success,
        notified_count: notificationResult.notifiedCount,
        total_contacts: notificationResult.totalCount
      }
    });
    
    return { 
      missed: true, 
      daysOverdue,
      notificationSent: notificationResult.success 
    };
  } catch (error) {
    console.error('Error checking for missed check-ins:', error);
    return { missed: false };
  }
};

/**
 * Manually trigger notifications to trusted contacts for testing
 */
export const testNotifyTrustedContacts = async (
  executorInfo: { name: string; email: string; phone?: string }
): Promise<boolean> => {
  try {
    const today = new Date();
    const testDate = new Date(today);
    testDate.setDate(today.getDate() - 14); // Simulate 2 weeks ago
    
    const formattedDate = testDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const result = await notifyAllTrustedContacts(
      formattedDate,
      executorInfo
    );
    
    return result.success;
  } catch (error) {
    console.error('Error in testNotifyTrustedContacts:', error);
    return false;
  }
};
