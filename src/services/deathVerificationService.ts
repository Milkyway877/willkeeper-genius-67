
import { supabase } from '@/integrations/supabase/client';

export interface DeathVerificationSettings {
  id: string;
  user_id: string;
  check_in_frequency: number;
  check_in_enabled: boolean;
  unlock_mode: string;
  trusted_contact_email?: string;
  beneficiary_verification_interval?: number;
  notification_preferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  failsafe_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DeathVerificationCheckin {
  id: string;
  user_id: string;
  checked_in_at: string;
  next_check_in: string;
  status: string;
}

// Get death verification settings for current user
export async function getDeathVerificationSettings(): Promise<DeathVerificationSettings | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default settings
        return await createDefaultSettings(userData.user.id);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching death verification settings:', error);
    return null;
  }
}

// Create default death verification settings for a user
async function createDefaultSettings(userId: string): Promise<DeathVerificationSettings | null> {
  try {
    const defaultSettings = {
      user_id: userId,
      check_in_frequency: 30, // 30 days
      check_in_enabled: true,
      unlock_mode: 'pin',
      beneficiary_verification_interval: 48, // 48 hours
      notification_preferences: {
        email: true,
        sms: false,
        push: false,
      },
      failsafe_enabled: true,
    };

    const { data, error } = await supabase
      .from('death_verification_settings')
      .insert([defaultSettings])
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error creating default death verification settings:', error);
    return null;
  }
}

// Update death verification settings
export async function updateDeathVerificationSettings(
  settings: Partial<DeathVerificationSettings>
): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    // Get current settings to ensure we have an ID
    const currentSettings = await getDeathVerificationSettings();
    if (!currentSettings) {
      throw new Error('No settings found');
    }

    const { error } = await supabase
      .from('death_verification_settings')
      .update(settings)
      .eq('id', currentSettings.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating death verification settings:', error);
    return false;
  }
}

// Get latest check-in
export const getLatestCheckIn = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('death_verification_checkins')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching latest check-in:', error);
    return null;
  }
};

// Process check-in
export const processCheckin = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const settings = await getDeathVerificationSettings();
    if (!settings) {
      throw new Error('No settings found');
    }

    const nextCheckIn = new Date();
    nextCheckIn.setDate(nextCheckIn.getDate() + settings.check_in_frequency);

    const { data, error } = await supabase
      .from('death_verification_checkins')
      .insert([
        {
          user_id: userData.user.id,
          checked_in_at: new Date().toISOString(),
          next_check_in: nextCheckIn.toISOString(),
          status: 'alive',
        },
      ])
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error processing check-in:', error);
    return null;
  }
};

// Add this alias for backwards compatibility
export const getLatestCheckin = getLatestCheckIn;
