
import { supabase } from '@/integrations/supabase/client';
import { createSystemNotification } from './notificationService';
import { addDays, addHours } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

export interface DeathVerificationSettings {
  id?: string;
  checkInEnabled: boolean;
  checkInFrequency: string;
  beneficiaryVerificationInterval: string;
  unlockMode: 'pin' | 'executor' | 'trusted';
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  trustedContactEmail: string;
  failsafeEnabled: boolean;
}

export interface CheckInInfo {
  id?: string;
  checkedInAt: string;
  nextCheckIn: string;
  status: string;
}

/**
 * Get death verification settings for the current user
 */
export const getDeathVerificationSettings = async (): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('No authenticated user found');
      return null;
    }

    // Check if settings exist for this user
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
      console.error('Error getting death verification settings:', error);
      return null;
    }
    
    // If no settings exist, create default settings
    if (!data) {
      return await createDefaultVerificationSettings(user.user.id);
    }
    
    // Convert from database format to frontend format
    const notificationPrefs = data.notification_preferences as Json;
    
    return {
      id: data.id,
      checkInEnabled: data.check_in_enabled,
      checkInFrequency: data.check_in_frequency.toString(),
      beneficiaryVerificationInterval: data.beneficiary_verification_interval.toString(),
      unlockMode: data.unlock_mode as 'pin' | 'executor' | 'trusted',
      notificationPreferences: {
        email: typeof notificationPrefs === 'object' && notificationPrefs !== null ? 
          !!(notificationPrefs as any).email : true,
        sms: typeof notificationPrefs === 'object' && notificationPrefs !== null ? 
          !!(notificationPrefs as any).sms : false,
        push: typeof notificationPrefs === 'object' && notificationPrefs !== null ? 
          !!(notificationPrefs as any).push : false
      },
      trustedContactEmail: data.trusted_contact_email || '',
      failsafeEnabled: data.failsafe_enabled
    };
  } catch (error) {
    console.error('Error in getDeathVerificationSettings:', error);
    return null;
  }
};

/**
 * Create default death verification settings for a new user
 */
const createDefaultVerificationSettings = async (userId: string): Promise<DeathVerificationSettings | null> => {
  try {
    const defaultSettings = {
      user_id: userId,
      check_in_enabled: true,
      check_in_frequency: 7,
      beneficiary_verification_interval: 48,
      unlock_mode: 'pin' as const,
      notification_preferences: {
        email: true,
        sms: false,
        push: false
      },
      failsafe_enabled: true
    };
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .insert(defaultSettings)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating default verification settings:', error);
      return null;
    }
    
    await createSystemNotification('will_updated', {
      title: 'Death Verification Enabled',
      description: 'Death verification system has been enabled for your will.'
    });
    
    // Safely parse the notification preferences
    const notificationPrefs = data.notification_preferences as Json;
    
    return {
      id: data.id,
      checkInEnabled: data.check_in_enabled,
      checkInFrequency: data.check_in_frequency.toString(),
      beneficiaryVerificationInterval: data.beneficiary_verification_interval.toString(),
      unlockMode: data.unlock_mode as 'pin' | 'executor' | 'trusted',
      notificationPreferences: {
        email: typeof notificationPrefs === 'object' && notificationPrefs !== null ? 
          !!(notificationPrefs as any).email : true,
        sms: typeof notificationPrefs === 'object' && notificationPrefs !== null ? 
          !!(notificationPrefs as any).sms : false,
        push: typeof notificationPrefs === 'object' && notificationPrefs !== null ? 
          !!(notificationPrefs as any).push : false
      },
      trustedContactEmail: data.trusted_contact_email || '',
      failsafeEnabled: data.failsafe_enabled
    };
  } catch (error) {
    console.error('Error in createDefaultVerificationSettings:', error);
    return null;
  }
};

/**
 * Update death verification settings
 */
export const updateDeathVerificationSettings = async (settings: DeathVerificationSettings): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Convert from frontend format to database format
    const dbSettings = {
      check_in_enabled: settings.checkInEnabled,
      check_in_frequency: parseInt(settings.checkInFrequency),
      beneficiary_verification_interval: parseInt(settings.beneficiaryVerificationInterval),
      unlock_mode: settings.unlockMode,
      notification_preferences: settings.notificationPreferences,
      trusted_contact_email: settings.trustedContactEmail || null,
      failsafe_enabled: settings.failsafeEnabled
    };
    
    const { error } = await supabase
      .from('death_verification_settings')
      .update(dbSettings)
      .eq('user_id', user.user.id);
      
    if (error) {
      console.error('Error updating verification settings:', error);
      return false;
    }
    
    await createSystemNotification('will_updated', {
      title: 'Settings Updated',
      description: 'Your death verification settings have been updated successfully.'
    });
    
    return true;
  } catch (error) {
    console.error('Error in updateDeathVerificationSettings:', error);
    return false;
  }
};

/**
 * Record a check-in for the user
 */
export const recordCheckIn = async (): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Get the user's settings to determine next check-in date
    const settings = await getDeathVerificationSettings();
    
    if (!settings) {
      console.error('No settings found for user');
      return false;
    }
    
    // Calculate next check-in date based on settings
    const nextCheckIn = addDays(new Date(), parseInt(settings.checkInFrequency));
    
    // Create check-in record
    const { error } = await supabase
      .from('death_verification_checkins')
      .insert({
        user_id: user.user.id,
        next_check_in: nextCheckIn.toISOString(),
        status: 'alive'
      });
      
    if (error) {
      console.error('Error recording check-in:', error);
      return false;
    }
    
    // Log the check-in
    await logVerificationEvent(user.user.id, 'check_in', {
      timestamp: new Date().toISOString()
    });
    
    await createSystemNotification('will_updated', {
      title: 'Check-in Confirmed',
      description: 'Your status has been confirmed. Your next check-in will be in ' + settings.checkInFrequency + ' days.'
    });
    
    return true;
  } catch (error) {
    console.error('Error in recordCheckIn:', error);
    return false;
  }
};

/**
 * Initiate death verification process
 */
export const initiateDeathVerification = async (userId: string): Promise<boolean> => {
  try {
    // Get the user's settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (settingsError) {
      console.error('Error getting verification settings:', settingsError);
      return false;
    }
    
    // Calculate expiration time for the verification request
    const expiresAt = addHours(new Date(), settingsData.beneficiary_verification_interval);
    
    // Create a verification request
    const { data: requestData, error: requestError } = await supabase
      .from('death_verification_requests')
      .insert({
        user_id: userId,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();
      
    if (requestError) {
      console.error('Error creating verification request:', requestError);
      return false;
    }
    
    // Log the verification initiation
    await logVerificationEvent(userId, 'verification_initiated', {
      request_id: requestData.id,
      expires_at: expiresAt.toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error in initiateDeathVerification:', error);
    return false;
  }
};

/**
 * Record a response from a beneficiary or executor
 */
export const recordVerificationResponse = async (
  requestId: string, 
  responderId: string, 
  response: 'alive' | 'deceased'
): Promise<boolean> => {
  try {
    // Insert the response
    const { error } = await supabase
      .from('death_verification_responses')
      .insert({
        request_id: requestId,
        responder_id: responderId,
        response
      });
      
    if (error) {
      console.error('Error recording verification response:', error);
      return false;
    }
    
    // If response is 'alive', update the request status to 'cancelled'
    if (response === 'alive') {
      const { data: requestData, error: requestError } = await supabase
        .from('death_verification_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .select()
        .single();
        
      if (requestError) {
        console.error('Error updating verification request:', requestError);
        return false;
      }
      
      // Log the cancellation
      await logVerificationEvent(requestData.user_id, 'verification_cancelled', {
        request_id: requestId,
        cancelled_by: responderId
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error in recordVerificationResponse:', error);
    return false;
  }
};

/**
 * Generate PIN codes for all beneficiaries and executors
 */
export const generatePinCodes = async (userId: string): Promise<boolean> => {
  try {
    // Get all beneficiaries for this user
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .select('id')
      .eq('user_id', userId);
      
    if (beneficiariesError) {
      console.error('Error getting beneficiaries:', beneficiariesError);
      return false;
    }
    
    // Get all executors for this user
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('id')
      .eq('user_id', userId);
      
    if (executorsError) {
      console.error('Error getting executors:', executorsError);
      return false;
    }
    
    // Generate PIN codes for each person
    const pinsToInsert = [
      ...beneficiaries.map(b => ({
        person_id: b.id,
        person_type: 'beneficiary',
        pin_code: generateRandomPin(),
        used: false
      })),
      ...executors.map(e => ({
        person_id: e.id,
        person_type: 'executor',
        pin_code: generateRandomPin(),
        used: false
      }))
    ];
    
    // Insert the PIN codes
    const { error: pinsError } = await supabase
      .from('death_verification_pins')
      .insert(pinsToInsert);
      
    if (pinsError) {
      console.error('Error generating PINs:', pinsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in generatePinCodes:', error);
    return false;
  }
};

/**
 * Validate a PIN code
 */
export const validatePin = async (personId: string, pin: string): Promise<boolean> => {
  try {
    // Find the PIN record
    const { data, error } = await supabase
      .from('death_verification_pins')
      .select('*')
      .eq('person_id', personId)
      .eq('pin_code', pin)
      .single();
      
    if (error) {
      console.error('Error validating PIN:', error);
      return false;
    }
    
    // Check if PIN has already been used
    if (data.used) {
      return false;
    }
    
    // Mark the PIN as used
    const { error: updateError } = await supabase
      .from('death_verification_pins')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', data.id);
      
    if (updateError) {
      console.error('Error marking PIN as used:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in validatePin:', error);
    return false;
  }
};

/**
 * Check if all required PINs have been used for a user
 */
export const checkAllPinsUsed = async (userId: string): Promise<boolean> => {
  try {
    // Get the settings to determine unlock mode
    const { data: settings, error: settingsError } = await supabase
      .from('death_verification_settings')
      .select('unlock_mode')
      .eq('user_id', userId)
      .single();
      
    if (settingsError) {
      console.error('Error getting settings:', settingsError);
      return false;
    }
    
    // If using executor override or trusted contact override, different logic applies
    if (settings.unlock_mode !== 'pin') {
      // TODO: Implement logic for other unlock modes
      return false;
    }
    
    // Get all PIN codes for this user's beneficiaries and executors
    const { data: pins, error: pinsError } = await supabase
      .from('death_verification_pins')
      .select('*')
      .eq('user_id', userId);
      
    if (pinsError) {
      console.error('Error getting PINs:', pinsError);
      return false;
    }
    
    // Check if all PINs have been used
    const allUsed = pins.every(pin => pin.used);
    
    return allUsed;
  } catch (error) {
    console.error('Error in checkAllPinsUsed:', error);
    return false;
  }
};

/**
 * Log a verification event
 */
export const logVerificationEvent = async (
  userId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<boolean> => {
  try {
    // Convert details to a proper Json type if provided
    const jsonDetails: Json | undefined = details ? details as Json : undefined;
    
    const { error } = await supabase
      .from('death_verification_logs')
      .insert({
        user_id: userId,
        action,
        details: jsonDetails
      });
      
    if (error) {
      console.error('Error logging verification event:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in logVerificationEvent:', error);
    return false;
  }
};

/**
 * Generate a random 10-digit PIN code
 */
const generateRandomPin = (): string => {
  const min = 1000000000; // 10-digit number (minimum)
  const max = 9999999999; // 10-digit number (maximum)
  return Math.floor(min + Math.random() * (max - min)).toString();
};
