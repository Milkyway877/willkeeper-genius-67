
import { supabase } from "@/integrations/supabase/client";

export type UnlockMode = 'pin' | 'executor' | 'trusted';

export interface DeathVerificationSettings {
  id?: string;
  user_id?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface DeathVerificationCheckin {
  id?: string;
  user_id?: string;
  executor_email: string;
  last_checkin: string;
  status: 'alive' | 'dead' | 'unknown';
}

export const DEFAULT_SETTINGS: DeathVerificationSettings = {
  check_in_enabled: true,
  check_in_frequency: 14,
  beneficiary_verification_interval: 48,
  notification_preferences: {
    email: true,
    sms: false,
    push: false
  },
  unlock_mode: 'pin',
  failsafe_enabled: true
};

// Function to get the user's death verification settings
export const getDeathVerificationSettings = async (): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting death verification settings:', error);
      return null;
    }
    
    if (!data) {
      return DEFAULT_SETTINGS;
    }
    
    return data as DeathVerificationSettings;
  } catch (error) {
    console.error('Error in getDeathVerificationSettings:', error);
    return null;
  }
};

// Function to create or update the user's death verification settings
export const saveDeathVerificationSettings = async (settings: DeathVerificationSettings): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from('death_verification_settings')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    let result;
    
    if (existingSettings?.id) {
      // Update existing settings
      result = await supabase
        .from('death_verification_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select();
    } else {
      // Create new settings
      result = await supabase
        .from('death_verification_settings')
        .insert({
          ...settings,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
    }
    
    if (result.error) {
      console.error('Error updating death verification settings:', result.error);
      return null;
    }
    
    return result.data[0] as DeathVerificationSettings;
  } catch (error) {
    console.error('Error in saveDeathVerificationSettings:', error);
    return null;
  }
};

// Function to get the latest check-in status
export const getLatestCheckin = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    const { data, error } = await supabase
      .from('user_checkins')
      .select('*')
      .eq('user_id', session.user.id)
      .order('last_checkin', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No check-ins found, which is fine
        return null;
      }
      console.error('Error getting latest check-in:', error);
      return null;
    }
    
    return data as DeathVerificationCheckin;
  } catch (error) {
    console.error('Error in getLatestCheckin:', error);
    return null;
  }
};

// Function to process a check-in from an executor
export const processCheckin = async (userId: string, executorEmail: string, newStatus: 'alive' | 'dead'): Promise<boolean> => {
  try {
    // Check if there's an existing check-in record
    const { data: existingCheckin, error: checkError } = await supabase
      .from('user_checkins')
      .select('id')
      .eq('user_id', userId)
      .eq('executor_email', executorEmail)
      .maybeSingle();
    
    let result;
    
    if (existingCheckin?.id) {
      // Update existing check-in
      result = await supabase
        .from('user_checkins')
        .update({
          status: newStatus,
          last_checkin: new Date().toISOString()
        })
        .eq('id', existingCheckin.id);
    } else {
      // Create new check-in
      result = await supabase
        .from('user_checkins')
        .insert({
          user_id: userId,
          executor_email: executorEmail,
          status: newStatus,
          last_checkin: new Date().toISOString()
        });
    }
    
    if (result.error) {
      console.error('Error processing check-in:', result.error);
      return false;
    }
    
    // If status is 'dead', we would trigger the will access process here
    if (newStatus === 'dead') {
      // For now, just log it - in a real app, we would send notifications to beneficiaries
      console.log(`User ${userId} has been declared deceased. Will access process should be initiated.`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in processCheckin:', error);
    return false;
  }
};

// Function to update the check-in status from the notification email
export const updateCheckInStatus = async (userId: string, executorEmail: string, status: 'alive' | 'dead'): Promise<boolean> => {
  try {
    // Simple validation
    if (!userId || !executorEmail) {
      return false;
    }
    
    return await processCheckin(userId, executorEmail, status);
  } catch (error) {
    console.error('Error in updateCheckInStatus:', error);
    return false;
  }
};

// Function to add an executor for death verification
export const addDeathVerificationExecutor = async (email: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    // Generate a confirmation token
    const confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Add the executor to the database
    const { error } = await supabase
      .from('executors')
      .insert({
        user_id: session.user.id,
        email,
        confirmation_token: confirmationToken,
        status: 'pending'
      });
    
    if (error) {
      console.error('Error adding executor:', error);
      return false;
    }
    
    // In a real app, we would send a confirmation email here
    // console.log(`Email sent to ${email} with confirmation token: ${confirmationToken}`);
    
    return true;
  } catch (error) {
    console.error('Error in addDeathVerificationExecutor:', error);
    return false;
  }
};

// Function to add a beneficiary for will access
export const addBeneficiary = async (email: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    // Generate a confirmation token
    const confirmationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Add the beneficiary to the database
    const { error } = await supabase
      .from('beneficiaries')
      .insert({
        user_id: session.user.id,
        email,
        confirmation_token: confirmationToken,
        status: 'pending'
      });
    
    if (error) {
      console.error('Error adding beneficiary:', error);
      return false;
    }
    
    // In a real app, we would send a confirmation email here
    // console.log(`Email sent to ${email} with confirmation token: ${confirmationToken}`);
    
    return true;
  } catch (error) {
    console.error('Error in addBeneficiary:', error);
    return false;
  }
};

// Function to get the user's executors
export const getUserExecutors = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    const { data, error } = await supabase
      .from('executors')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error getting executors:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserExecutors:', error);
    return [];
  }
};

// Function to get the user's beneficiaries
export const getUserBeneficiaries = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user');
    }
    
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error getting beneficiaries:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserBeneficiaries:', error);
    return [];
  }
};

// Function to confirm or decline a role (executor or beneficiary)
export const confirmRole = async (token: string, type: 'executor' | 'beneficiary'): Promise<boolean> => {
  try {
    const table = type === 'executor' ? 'executors' : 'beneficiaries';
    
    const { data, error } = await supabase
      .from(table)
      .update({ status: 'confirmed' })
      .eq('confirmation_token', token)
      .select();
    
    if (error || !data || data.length === 0) {
      console.error(`Error confirming ${type}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in confirmRole for ${type}:`, error);
    return false;
  }
};

export const declineRole = async (token: string, type: 'executor' | 'beneficiary'): Promise<boolean> => {
  try {
    const table = type === 'executor' ? 'executors' : 'beneficiaries';
    
    const { data, error } = await supabase
      .from(table)
      .update({ status: 'declined' })
      .eq('confirmation_token', token)
      .select();
    
    if (error || !data || data.length === 0) {
      console.error(`Error declining ${type}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in declineRole for ${type}:`, error);
    return false;
  }
};

// Generate a death verification PIN for accessing the will
export const generateAccessPin = async (userId: string): Promise<string | null> => {
  try {
    // Generate a 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the PIN in the database for later verification
    const { error } = await supabase
      .from('death_verification_pins')
      .insert({
        person_id: userId,
        pin_code: pin,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
        used: false
      });
    
    if (error) {
      console.error('Error generating PIN:', error);
      return null;
    }
    
    return pin;
  } catch (error) {
    console.error('Error in generateAccessPin:', error);
    return null;
  }
};
