
import { supabase } from '@/integrations/supabase/client';
import { createSystemNotification } from './notificationService';

export interface DeathVerificationSettings {
  checkInEnabled: boolean;
  checkInFrequency: string; // "7", "14", or "30" days
  beneficiaryVerificationInterval: string; // "48" or "72" hours
  unlockMode: 'pin' | 'executor' | 'trusted';
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  trustedContactEmail: string;
  failsafeEnabled: boolean;
}

export interface CheckInRecord {
  id: string;
  user_id: string;
  checked_in_at: string;
  status: 'alive' | 'no_response';
  next_check_in: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  initiated_at: string;
  status: 'pending' | 'confirmed_alive' | 'confirmed_deceased';
  expires_at: string;
}

export interface UnlockPIN {
  id: string;
  person_id: string;
  person_type: 'beneficiary' | 'executor' | 'trusted_contact';
  pin_code: string;
  created_at: string;
  used: boolean;
  used_at: string | null;
}

const defaultSettings: DeathVerificationSettings = {
  checkInEnabled: true,
  checkInFrequency: '7',
  beneficiaryVerificationInterval: '48',
  unlockMode: 'pin',
  notificationPreferences: {
    email: true,
    sms: false,
    push: false
  },
  trustedContactEmail: '',
  failsafeEnabled: true
};

// Get death verification settings for the current user
export const getDeathVerificationSettings = async (): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user found');
    }
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found, create default settings
        return createDefaultSettings();
      }
      
      console.error('Error fetching death verification settings:', error);
      return null;
    }
    
    // Convert from database format to application format
    return {
      checkInEnabled: data.check_in_enabled,
      checkInFrequency: data.check_in_frequency.toString(),
      beneficiaryVerificationInterval: data.beneficiary_verification_interval.toString(),
      unlockMode: data.unlock_mode,
      notificationPreferences: data.notification_preferences,
      trustedContactEmail: data.trusted_contact_email || '',
      failsafeEnabled: data.failsafe_enabled
    };
  } catch (error) {
    console.error('Error in getDeathVerificationSettings:', error);
    return null;
  }
};

// Create default settings for a new user
export const createDefaultSettings = async (): Promise<DeathVerificationSettings> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user found');
    }
    
    // Convert from application format to database format
    const dbSettings = {
      user_id: session.user.id,
      check_in_enabled: defaultSettings.checkInEnabled,
      check_in_frequency: parseInt(defaultSettings.checkInFrequency),
      beneficiary_verification_interval: parseInt(defaultSettings.beneficiaryVerificationInterval),
      unlock_mode: defaultSettings.unlockMode,
      notification_preferences: defaultSettings.notificationPreferences,
      trusted_contact_email: defaultSettings.trustedContactEmail,
      failsafe_enabled: defaultSettings.failsafeEnabled
    };
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .insert(dbSettings)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating default death verification settings:', error);
      throw error;
    }

    await createSystemNotification('security_update', {
      title: 'Death Verification Enabled',
      description: 'Death verification system has been set up with default settings. You can customize these in your security settings.'
    });
    
    return defaultSettings;
  } catch (error) {
    console.error('Error in createDefaultSettings:', error);
    return defaultSettings;
  }
};

// Update death verification settings
export const updateDeathVerificationSettings = async (settings: DeathVerificationSettings): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user found');
    }
    
    // Convert from application format to database format
    const dbSettings = {
      check_in_enabled: settings.checkInEnabled,
      check_in_frequency: parseInt(settings.checkInFrequency),
      beneficiary_verification_interval: parseInt(settings.beneficiaryVerificationInterval),
      unlock_mode: settings.unlockMode,
      notification_preferences: settings.notificationPreferences,
      trusted_contact_email: settings.trustedContactEmail,
      failsafe_enabled: settings.failsafeEnabled
    };
    
    const { error } = await supabase
      .from('death_verification_settings')
      .upsert({ 
        user_id: session.user.id,
        ...dbSettings
      });
      
    if (error) {
      console.error('Error updating death verification settings:', error);
      return false;
    }

    await createSystemNotification('security_update', {
      title: 'Death Verification Settings Updated',
      description: 'Your death verification settings have been successfully updated.'
    });
    
    return true;
  } catch (error) {
    console.error('Error in updateDeathVerificationSettings:', error);
    return false;
  }
};

// Record a check-in from the user
export const recordCheckIn = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No authenticated user found');
    }
    
    // Get user settings to calculate next check-in date
    const settings = await getDeathVerificationSettings();
    if (!settings) {
      throw new Error('Could not retrieve user settings');
    }
    
    // Calculate next check-in date
    const checkInFrequency = parseInt(settings.checkInFrequency);
    const nextCheckIn = new Date();
    nextCheckIn.setDate(nextCheckIn.getDate() + checkInFrequency);
    
    // Update or insert check-in record
    const { error } = await supabase
      .from('death_verification_checkins')
      .upsert({
        user_id: session.user.id,
        checked_in_at: new Date().toISOString(),
        status: 'alive',
        next_check_in: nextCheckIn.toISOString()
      });
      
    if (error) {
      console.error('Error recording check-in:', error);
      return false;
    }
    
    await createSystemNotification('check_in_confirmed', {
      title: 'Check-in Confirmed',
      description: `You have successfully checked in. Your next check-in is scheduled in ${checkInFrequency} days.`
    });
    
    return true;
  } catch (error) {
    console.error('Error in recordCheckIn:', error);
    return false;
  }
};

// Initiate beneficiary verification process
export const initiateBeneficiaryVerification = async (userId: string): Promise<boolean> => {
  try {
    // Get user settings to calculate expiration time
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user settings for verification:', error);
      return false;
    }
    
    // Calculate expiration time
    const verificationInterval = data.beneficiary_verification_interval;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + verificationInterval);
    
    // Create verification request
    const { error: requestError } = await supabase
      .from('death_verification_requests')
      .insert({
        user_id: userId,
        initiated_at: new Date().toISOString(),
        status: 'pending',
        expires_at: expiresAt.toISOString()
      });
      
    if (requestError) {
      console.error('Error creating verification request:', requestError);
      return false;
    }
    
    // TODO: Send notifications to beneficiaries and executors
    // This would be handled by a separate function or an edge function
    
    return true;
  } catch (error) {
    console.error('Error in initiateBeneficiaryVerification:', error);
    return false;
  }
};

// Handle beneficiary/executor verification response
export const handleVerificationResponse = async (
  requestId: string, 
  responderId: string, 
  response: 'alive' | 'deceased'
): Promise<boolean> => {
  try {
    // Record response
    const { error: responseError } = await supabase
      .from('death_verification_responses')
      .insert({
        request_id: requestId,
        responder_id: responderId,
        response,
        responded_at: new Date().toISOString()
      });
      
    if (responseError) {
      console.error('Error recording verification response:', responseError);
      return false;
    }
    
    // If response is 'alive', cancel verification process
    if (response === 'alive') {
      const { error: updateError } = await supabase
        .from('death_verification_requests')
        .update({ status: 'confirmed_alive' })
        .eq('id', requestId);
        
      if (updateError) {
        console.error('Error updating verification request status:', updateError);
        return false;
      }
      
      // Reset check-in
      // This would typically get the user_id from the request and call recordCheckIn for that user
      
      return true;
    }
    
    // If response is 'deceased', check if all have responded as 'deceased'
    // This would require a more complex query to check all responses
    // If all confirmed deceased, trigger the PIN unlock process
    
    return true;
  } catch (error) {
    console.error('Error in handleVerificationResponse:', error);
    return false;
  }
};

// Generate PIN codes for all beneficiaries and executors
export const generatePINCodes = async (userId: string): Promise<boolean> => {
  try {
    // Get all beneficiaries and executors
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .select('id')
      .eq('user_id', userId);
      
    if (beneficiariesError) {
      console.error('Error fetching beneficiaries:', beneficiariesError);
      return false;
    }
    
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('id')
      .eq('user_id', userId);
      
    if (executorsError) {
      console.error('Error fetching executors:', executorsError);
      return false;
    }
    
    // Generate PIN codes for each
    const pinsToInsert = [
      ...beneficiaries.map(b => ({
        person_id: b.id,
        person_type: 'beneficiary',
        pin_code: generateRandomPIN(10),
        used: false
      })),
      ...executors.map(e => ({
        person_id: e.id,
        person_type: 'executor',
        pin_code: generateRandomPIN(10),
        used: false
      }))
    ];
    
    if (pinsToInsert.length === 0) {
      console.warn('No beneficiaries or executors found for PIN generation');
      return false;
    }
    
    // Insert PINs
    const { error: pinsError } = await supabase
      .from('death_verification_pins')
      .insert(pinsToInsert);
      
    if (pinsError) {
      console.error('Error generating PIN codes:', pinsError);
      return false;
    }
    
    // TODO: Send PIN codes to beneficiaries and executors
    // This would be handled by a separate function or an edge function
    
    return true;
  } catch (error) {
    console.error('Error in generatePINCodes:', error);
    return false;
  }
};

// Verify a PIN code
export const verifyPIN = async (pinCode: string): Promise<boolean> => {
  try {
    // Check if PIN exists and hasn't been used
    const { data: pin, error: pinError } = await supabase
      .from('death_verification_pins')
      .select('*')
      .eq('pin_code', pinCode)
      .eq('used', false)
      .single();
      
    if (pinError) {
      console.error('Error verifying PIN:', pinError);
      return false;
    }
    
    // Mark PIN as used
    const { error: updateError } = await supabase
      .from('death_verification_pins')
      .update({ 
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', pin.id);
      
    if (updateError) {
      console.error('Error marking PIN as used:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in verifyPIN:', error);
    return false;
  }
};

// Helper: Generate a random PIN code
const generateRandomPIN = (length: number): string => {
  const digits = '0123456789';
  let pin = '';
  
  for (let i = 0; i < length; i++) {
    pin += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return pin;
};

// Check if all PINs have been used for a will
export const checkAllPINsUsed = async (userId: string): Promise<boolean> => {
  try {
    // Get all beneficiaries and executors
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .select('id')
      .eq('user_id', userId);
      
    if (beneficiariesError) {
      console.error('Error fetching beneficiaries:', beneficiariesError);
      return false;
    }
    
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('id')
      .eq('user_id', userId);
      
    if (executorsError) {
      console.error('Error fetching executors:', executorsError);
      return false;
    }
    
    // Get all person IDs
    const personIds = [
      ...beneficiaries.map(b => b.id),
      ...executors.map(e => e.id)
    ];
    
    // Check if all have used their PINs
    const { data: pins, error: pinsError } = await supabase
      .from('death_verification_pins')
      .select('*')
      .in('person_id', personIds);
      
    if (pinsError) {
      console.error('Error checking PIN status:', pinsError);
      return false;
    }
    
    // Check if all required PINs have been used
    const allUsed = pins.every(pin => pin.used);
    
    return allUsed;
  } catch (error) {
    console.error('Error in checkAllPINsUsed:', error);
    return false;
  }
};

// Send check-in reminder to user
export const sendCheckInReminder = async (userId: string): Promise<boolean> => {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return false;
    }
    
    // Get user notification preferences
    const { data: settings, error: settingsError } = await supabase
      .from('death_verification_settings')
      .select('notification_preferences')
      .eq('user_id', userId)
      .single();
      
    if (settingsError) {
      console.error('Error fetching notification preferences:', settingsError);
      return false;
    }
    
    // TODO: Send reminder based on preferences
    // This would be handled by a separate function or an edge function
    
    // Log the reminder
    const { error: logError } = await supabase
      .from('death_verification_logs')
      .insert({
        user_id: userId,
        action: 'check_in_reminder_sent',
        timestamp: new Date().toISOString()
      });
      
    if (logError) {
      console.error('Error logging reminder:', logError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in sendCheckInReminder:', error);
    return false;
  }
};
