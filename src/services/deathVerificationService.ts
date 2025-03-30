
import { supabase } from "@/integrations/supabase/client";
import { addDays } from "date-fns";

export type UnlockMode = 'pin' | 'executor' | 'trusted';

export interface DeathVerificationSettings {
  id: string;
  user_id: string;
  check_in_enabled: boolean;
  check_in_frequency: number;
  beneficiary_verification_interval: number;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  unlock_mode: UnlockMode;
  trusted_contact_email?: string;
  failsafe_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeathVerificationCheckin {
  id: string;
  user_id: string;
  status: string;
  checked_in_at: string;
  next_check_in: string;
  created_at: string;
}

export const DEFAULT_SETTINGS: DeathVerificationSettings = {
  id: '',
  user_id: '',
  check_in_enabled: true,
  check_in_frequency: 7,
  beneficiary_verification_interval: 48,
  notification_preferences: {
    email: true,
    sms: false,
    push: false
  },
  unlock_mode: 'pin',
  failsafe_enabled: true,
  created_at: '',
  updated_at: ''
};

export const getDeathVerificationSettings = async (): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot get death verification settings');
      return null;
    }
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      // If no record exists, create default settings
      if (error.code === 'PGRST116') {
        return createDefaultSettings(session.user.id);
      }
      
      console.error('Error fetching death verification settings:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDeathVerificationSettings:', error);
    return null;
  }
};

const createDefaultSettings = async (userId: string): Promise<DeathVerificationSettings | null> => {
  try {
    const defaultSettings = {
      ...DEFAULT_SETTINGS,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .insert(defaultSettings)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default death verification settings:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createDefaultSettings:', error);
    return null;
  }
};

export const saveDeathVerificationSettings = async (settings: DeathVerificationSettings): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot save death verification settings');
      return null;
    }
    
    const { data: existingSettings } = await supabase
      .from('death_verification_settings')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    let savedSettings;
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('death_verification_settings')
        .update({
          check_in_enabled: settings.check_in_enabled,
          check_in_frequency: settings.check_in_frequency,
          beneficiary_verification_interval: settings.beneficiary_verification_interval,
          notification_preferences: settings.notification_preferences,
          unlock_mode: settings.unlock_mode,
          trusted_contact_email: settings.trusted_contact_email,
          failsafe_enabled: settings.failsafe_enabled
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating death verification settings:', error);
        return null;
      }
      
      savedSettings = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('death_verification_settings')
        .insert({
          user_id: session.user.id,
          check_in_enabled: settings.check_in_enabled,
          check_in_frequency: settings.check_in_frequency,
          beneficiary_verification_interval: settings.beneficiary_verification_interval,
          notification_preferences: settings.notification_preferences,
          unlock_mode: settings.unlock_mode,
          trusted_contact_email: settings.trusted_contact_email,
          failsafe_enabled: settings.failsafe_enabled
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating death verification settings:', error);
        return null;
      }
      
      savedSettings = data;
    }
    
    // Log the settings change
    await logDeathVerificationAction('settings_updated', {
      settings: {
        check_in_enabled: settings.check_in_enabled,
        check_in_frequency: settings.check_in_frequency,
        unlock_mode: settings.unlock_mode
      }
    });
    
    return savedSettings;
  } catch (error) {
    console.error('Error in saveDeathVerificationSettings:', error);
    return null;
  }
};

export const getLatestCheckin = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot get latest check-in');
      return null;
    }
    
    const { data, error } = await supabase
      .from('death_verification_checkins')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No check-ins yet
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

export const processCheckin = async (status: 'alive'): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot process check-in');
      return null;
    }
    
    // Get user's verification settings
    const settings = await getDeathVerificationSettings();
    
    if (!settings) {
      console.error('Error processing check-in: Unable to retrieve user settings');
      return null;
    }
    
    // Calculate next check-in date based on settings
    const now = new Date();
    const nextCheckIn = addDays(now, settings.check_in_frequency);
    
    // Create new check-in record
    const { data, error } = await supabase
      .from('death_verification_checkins')
      .insert({
        user_id: session.user.id,
        status: status,
        checked_in_at: now.toISOString(),
        next_check_in: nextCheckIn.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating check-in record:', error);
      return null;
    }
    
    // Log the check-in action
    await logDeathVerificationAction('checked_in', {
      status: status,
      next_check_in: nextCheckIn.toISOString()
    });
    
    return data;
  } catch (error) {
    console.error('Error in processCheckin:', error);
    return null;
  }
};

const logDeathVerificationAction = async (action: string, details?: any): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('User not authenticated, cannot log death verification action');
      return;
    }
    
    await supabase
      .from('death_verification_logs')
      .insert({
        user_id: session.user.id,
        action: action,
        details: details || null
      });
  } catch (error) {
    console.error('Error logging death verification action:', error);
  }
};
