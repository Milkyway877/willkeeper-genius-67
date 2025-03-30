import { supabase } from '@/integrations/supabase/client';
import { notifyProfileUpdated } from '@/services/notificationService';

export type UserProfile = {
  id: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  activation_complete?: boolean;
  email?: string;
  email_verified?: boolean;
};

export type UserSettings = {
  id: string;
  user_id: string;
  notification_settings?: any;
  privacy_settings?: any;
  created_at?: string;
  updated_at?: string;
};

// Get the current user's profile
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();
      
    if (error) throw error;
    
    // Add email from auth.user
    return {
      ...data,
      email: user.user.email,
      email_verified: user.user.email_confirmed_at !== null
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update the current user's profile
export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    // Don't include email or email_verified in the update as they're managed by Auth
    const { email, email_verified, ...dbUpdates } = updates;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', user.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Create a notification for the profile update
    const updateField = updates.full_name ? 'profile' 
      : updates.avatar_url ? 'avatar' 
      : 'profile information';
    
    await notifyProfileUpdated(updateField);
    
    // Add email from auth.user
    return {
      ...data,
      email: user.user.email,
      email_verified: user.user.email_confirmed_at !== null
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Get user settings
export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    // First try to get existing settings
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // If settings don't exist, create them
        const { data: newSettings, error: createError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.user.id,
            notification_settings: {},
            privacy_settings: {}
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newSettings;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

// Update user settings
export const updateUserSettings = async (updates: Partial<UserSettings>): Promise<UserSettings | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    // Ensure updates don't include user_id to prevent accidental changes
    const { user_id, ...safeUpdates } = updates;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .update(safeUpdates)
      .eq('user_id', user.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return null;
  }
};

// Get death verification settings
export const getDeathVerificationSettings = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    // First try to get existing settings
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // If settings don't exist, create default settings
        const { data: newSettings, error: createError } = await supabase
          .from('death_verification_settings')
          .insert({
            user_id: user.user.id,
            check_in_frequency: 7,
            check_in_enabled: true,
            beneficiary_verification_interval: 48,
            notification_preferences: {
              email: true,
              sms: false,
              push: false
            },
            unlock_mode: 'pin',
            failsafe_enabled: true
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newSettings;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching death verification settings:', error);
    return null;
  }
};

// Update death verification settings
export const updateDeathVerificationSettings = async (updates: any) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');
    
    // Ensure updates don't include user_id to prevent accidental changes
    const { user_id, ...safeUpdates } = updates;
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .update(safeUpdates)
      .eq('user_id', user.user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating death verification settings:', error);
    return null;
  }
};
