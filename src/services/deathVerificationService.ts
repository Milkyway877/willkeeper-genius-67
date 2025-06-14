import { supabase } from '@/integrations/supabase/client';

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
  trusted_contact_email?: string;
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
    console.log('deathVerificationService: Getting user session...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('deathVerificationService: No authenticated user found');
      return null;
    }
    
    console.log('deathVerificationService: Fetching settings for user:', session.user.id);
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('deathVerificationService: No settings found, returning defaults');
        return DEFAULT_SETTINGS;
      }
      console.error('deathVerificationService: Error fetching settings:', error);
      return null;
    }
    
    console.log('deathVerificationService: Settings fetched successfully:', data);
    return data || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('deathVerificationService: Exception in getDeathVerificationSettings:', error);
    return null;
  }
};

export const saveDeathVerificationSettings = async (settings: DeathVerificationSettings): Promise<DeathVerificationSettings | null> => {
  try {
    console.log('deathVerificationService: Getting user session for save...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('deathVerificationService: No authenticated user found for save');
      return null;
    }
    
    console.log('deathVerificationService: Saving settings for user:', session.user.id, settings);
    
    // Check if settings already exist for this user
    const { data: existingSettings } = await supabase
      .from('death_verification_settings')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    if (existingSettings) {
      console.log('deathVerificationService: Updating existing settings...');
      // Update existing settings
      const { data, error } = await supabase
        .from('death_verification_settings')
        .update({
          check_in_enabled: settings.check_in_enabled,
          check_in_frequency: settings.check_in_frequency,
          grace_period: settings.grace_period,
          beneficiary_verification_interval: settings.beneficiary_verification_interval,
          reminder_frequency: settings.reminder_frequency,
          pin_system_enabled: settings.pin_system_enabled,
          executor_override_enabled: settings.executor_override_enabled,
          trusted_contact_enabled: settings.trusted_contact_enabled,
          trusted_contact_email: settings.trusted_contact_email,
          failsafe_enabled: settings.failsafe_enabled,
          notification_preferences: settings.notification_preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .select()
        .single();
      
      if (error) {
        console.error('deathVerificationService: Error updating settings:', error);
        return null;
      }
      
      console.log('deathVerificationService: Settings updated successfully:', data);
      return data;
    } else {
      console.log('deathVerificationService: Creating new settings...');
      // Insert new settings
      const { data, error } = await supabase
        .from('death_verification_settings')
        .insert({
          user_id: session.user.id,
          check_in_enabled: settings.check_in_enabled,
          check_in_frequency: settings.check_in_frequency,
          grace_period: settings.grace_period,
          beneficiary_verification_interval: settings.beneficiary_verification_interval,
          reminder_frequency: settings.reminder_frequency,
          pin_system_enabled: settings.pin_system_enabled,
          executor_override_enabled: settings.executor_override_enabled,
          trusted_contact_enabled: settings.trusted_contact_enabled,
          trusted_contact_email: settings.trusted_contact_email,
          failsafe_enabled: settings.failsafe_enabled,
          notification_preferences: settings.notification_preferences
        })
        .select()
        .single();
      
      if (error) {
        console.error('deathVerificationService: Error inserting settings:', error);
        return null;
      }
      
      console.log('deathVerificationService: Settings created successfully:', data);
      return data;
    }
  } catch (error) {
    console.error('deathVerificationService: Exception in saveDeathVerificationSettings:', error);
    return null;
  }
};

export const createInitialCheckin = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    console.log('deathVerificationService: Creating initial checkin...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('deathVerificationService: No authenticated user found for checkin');
      return null;
    }
    
    // Get the user's settings to determine check-in frequency
    const settings = await getDeathVerificationSettings();
    if (!settings) {
      console.error('deathVerificationService: Failed to get settings for checkin');
      return null;
    }
    
    // Calculate next check-in date based on settings
    const now = new Date();
    const nextCheckIn = new Date();
    nextCheckIn.setDate(now.getDate() + settings.check_in_frequency);
    
    console.log('deathVerificationService: Creating checkin record with next checkin:', nextCheckIn);
    
    // Create the check-in record
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
      console.error('deathVerificationService: Error creating initial checkin:', error);
      return null;
    }
    
    console.log('deathVerificationService: Initial checkin created successfully:', data);
    return data;
  } catch (error) {
    console.error('deathVerificationService: Exception in createInitialCheckin:', error);
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
