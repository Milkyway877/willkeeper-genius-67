import { supabase } from "@/integrations/supabase/client";
import { createNotificationForEvent } from "./notificationService";
import { Beneficiary, Executor, getBeneficiaries, getExecutors } from "./executorService";
import { Database } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";

// Types
export type UnlockMode = 'pin' | 'executor' | 'trusted';
export type CheckinStatus = 'alive' | 'pending' | 'verification_triggered';
export type VerificationRequestStatus = 'pending' | 'verified' | 'canceled';
export type VerificationResponse = 'alive' | 'dead';

export interface DeathVerificationSettings {
  id?: string;
  user_id: string;
  check_in_enabled: boolean;
  check_in_frequency: number; // in days (7, 14, 30)
  beneficiary_verification_interval: number; // in hours (48, 72)
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  failsafe_enabled: boolean;
  trusted_contact_email?: string;
  unlock_mode: UnlockMode;
  created_at?: string;
  updated_at?: string;
}

export interface DeathVerificationCheckin {
  id?: string;
  user_id: string;
  status: CheckinStatus;
  next_check_in: string; // ISO date string
  checked_in_at: string; // ISO date string
  created_at?: string;
}

export interface DeathVerificationPin {
  id?: string;
  person_id: string;
  pin_code: string;
  person_type: 'beneficiary' | 'executor' | 'trusted';
  used: boolean;
  used_at?: string;
  created_at?: string;
}

export interface VerificationRequest {
  id?: string;
  user_id: string;
  initiated_at: string;
  expires_at: string;
  status: VerificationRequestStatus;
}

export interface VerificationResponseRecord {
  id?: string;
  request_id: string;
  responder_id: string;
  response: VerificationResponse;
  responded_at: string;
}

export const DEFAULT_SETTINGS: DeathVerificationSettings = {
  user_id: '', // Will be set at runtime
  check_in_enabled: true,
  check_in_frequency: 7, // 7 days
  beneficiary_verification_interval: 48, // 48 hours
  notification_preferences: {
    email: true,
    sms: false,
    push: false
  },
  failsafe_enabled: true,
  unlock_mode: 'pin'
};

export const getDeathVerificationSettings = async (): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting death verification settings:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    return data as DeathVerificationSettings;
  } catch (error) {
    console.error('Error in getDeathVerificationSettings:', error);
    return null;
  }
};

export const saveDeathVerificationSettings = async (settings: DeathVerificationSettings): Promise<DeathVerificationSettings | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const settingsWithUserId = {
      ...settings,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };
    
    const { data: existingSettings } = await supabase
      .from('death_verification_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    let result;
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('death_verification_settings')
        .update(settingsWithUserId)
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('death_verification_settings')
        .insert({ ...settingsWithUserId, created_at: new Date().toISOString() })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      result = data;
      
      // Create initial check-in record
      await createInitialCheckin();
    }
    
    await createNotificationForEvent('security_key_generated', {
      title: 'Death Verification Settings Updated',
      description: 'Your death verification settings have been updated successfully.'
    });
    
    return result as DeathVerificationSettings;
  } catch (error) {
    console.error('Error in saveDeathVerificationSettings:', error);
    return null;
  }
};

export const getLatestCheckin = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('death_verification_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting latest check-in:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    return data as DeathVerificationCheckin;
  } catch (error) {
    console.error('Error in getLatestCheckin:', error);
    return null;
  }
};

export const createInitialCheckin = async (): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const settings = await getDeathVerificationSettings();
    const checkInFrequency = settings?.check_in_frequency || DEFAULT_SETTINGS.check_in_frequency;
    
    const now = new Date();
    const nextCheckIn = new Date(now);
    nextCheckIn.setDate(nextCheckIn.getDate() + checkInFrequency);
    
    const checkinData = {
      user_id: user.id,
      status: 'alive' as CheckinStatus,
      checked_in_at: now.toISOString(),
      next_check_in: nextCheckIn.toISOString()
    };
    
    const { data, error } = await supabase
      .from('death_verification_checkins')
      .insert(checkinData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    await logVerificationEvent('check_in_created', { 
      checkin_id: data.id, 
      next_check_in: data.next_check_in 
    });
    
    return data as DeathVerificationCheckin;
  } catch (error) {
    console.error('Error in createInitialCheckin:', error);
    return null;
  }
};

export const processCheckin = async (status: 'alive'): Promise<DeathVerificationCheckin | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const settings = await getDeathVerificationSettings();
    const checkInFrequency = settings?.check_in_frequency || DEFAULT_SETTINGS.check_in_frequency;
    
    const now = new Date();
    const nextCheckIn = new Date(now);
    nextCheckIn.setDate(nextCheckIn.getDate() + checkInFrequency);
    
    const checkinData = {
      user_id: user.id,
      status: 'alive' as CheckinStatus,
      checked_in_at: now.toISOString(),
      next_check_in: nextCheckIn.toISOString()
    };
    
    const { data, error } = await supabase
      .from('death_verification_checkins')
      .insert(checkinData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    await logVerificationEvent('check_in_confirmed', { 
      checkin_id: data.id, 
      status: status, 
      next_check_in: data.next_check_in 
    });
    
    await createNotificationForEvent('security_key_generated', {
      title: 'Check-in Confirmed',
      description: 'You have successfully checked in. Your next check-in is scheduled.'
    });
    
    return data as DeathVerificationCheckin;
  } catch (error) {
    console.error('Error in processCheckin:', error);
    return null;
  }
};

export const generatePINCode = (): string => {
  const digits = '0123456789';
  let pin = '';
  for (let i = 0; i < 10; i++) {
    pin += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return pin;
};

export const generateAndStorePINCodes = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const beneficiaries = await getBeneficiaries();
    const executors = await getExecutors();
    
    for (const beneficiary of beneficiaries) {
      const pinCode = generatePINCode();
      
      const { error } = await supabase
        .from('death_verification_pins')
        .insert({
          person_id: beneficiary.id,
          pin_code: pinCode,
          person_type: 'beneficiary',
          used: false
        });
      
      if (error) {
        throw error;
      }
    }
    
    for (const executor of executors) {
      const pinCode = generatePINCode();
      
      const { error } = await supabase
        .from('death_verification_pins')
        .insert({
          person_id: executor.id,
          pin_code: pinCode,
          person_type: 'executor',
          used: false
        });
      
      if (error) {
        throw error;
      }
    }
    
    const settings = await getDeathVerificationSettings();
    if (settings?.trusted_contact_email) {
      const pinCode = generatePINCode();
      
      const { error } = await supabase
        .from('death_verification_pins')
        .insert({
          person_id: user.id,
          pin_code: pinCode,
          person_type: 'trusted',
          used: false
        });
      
      if (error) {
        throw error;
      }
    }
    
    await logVerificationEvent('pins_generated', { 
      beneficiary_count: beneficiaries.length,
      executor_count: executors.length,
      has_trusted_contact: !!settings?.trusted_contact_email
    });
    
    return true;
  } catch (error) {
    console.error('Error in generateAndStorePINCodes:', error);
    return false;
  }
};

export const validatePINCode = async (pinCode: string, personId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('death_verification_pins')
      .select('*')
      .eq('person_id', personId)
      .eq('pin_code', pinCode)
      .eq('used', false)
      .single();
    
    if (error || !data) {
      return false;
    }
    
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
    
    await logVerificationEvent('pin_validated', {
      pin_id: data.id,
      person_type: data.person_type
    });
    
    return true;
  } catch (error) {
    console.error('Error in validatePINCode:', error);
    return false;
  }
};

export const checkAllPINsValidated = async (userId: string): Promise<boolean> => {
  try {
    const beneficiaries = await getBeneficiaries();
    const executors = await getExecutors();
    
    const { data: pins, error } = await supabase
      .from('death_verification_pins')
      .select('*')
      .in('person_type', ['beneficiary', 'executor']);
    
    if (error) {
      throw error;
    }
    
    if (!pins || pins.length === 0) {
      return false;
    }
    
    const totalPeople = beneficiaries.length + executors.length;
    const usedPins = pins.filter(pin => pin.used).length;
    
    return usedPins === totalPeople;
  } catch (error) {
    console.error('Error in checkAllPINsValidated:', error);
    return false;
  }
};

export const triggerDeathVerification = async (userId: string): Promise<boolean> => {
  try {
    const settings = await getDeathVerificationSettings();
    const interval = settings?.beneficiary_verification_interval || DEFAULT_SETTINGS.beneficiary_verification_interval;
    
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + interval);
    
    const requestData = {
      user_id: userId,
      initiated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'pending' as VerificationRequestStatus
    };
    
    const { data, error } = await supabase
      .from('death_verification_requests')
      .insert(requestData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const { error: updateError } = await supabase
      .from('death_verification_checkins')
      .update({ status: 'verification_triggered' as CheckinStatus })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (updateError) {
      throw updateError;
    }
    
    await logVerificationEvent('verification_triggered', {
      request_id: data.id,
      expires_at: data.expires_at
    });
    
    await generateAndStorePINCodes();
    
    return true;
  } catch (error) {
    console.error('Error in triggerDeathVerification:', error);
    return false;
  }
};

export const processVerificationResponse = async (
  requestId: string, 
  responderId: string, 
  response: VerificationResponse
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('death_verification_responses')
      .insert({
        request_id: requestId,
        responder_id: responderId,
        response,
        responded_at: new Date().toISOString()
      });
    
    if (error) {
      throw error;
    }
    
    if (response === 'alive') {
      const { error: updateError } = await supabase
        .from('death_verification_requests')
        .update({ status: 'canceled' as VerificationRequestStatus })
        .eq('id', requestId);
      
      if (updateError) {
        throw updateError;
      }
      
      const { data: requestData } = await supabase
        .from('death_verification_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();
      
      if (requestData) {
        const settings = await getDeathVerificationSettings();
        const checkInFrequency = settings?.check_in_frequency || DEFAULT_SETTINGS.check_in_frequency;
        
        const now = new Date();
        const nextCheckIn = new Date(now);
        nextCheckIn.setDate(nextCheckIn.getDate() + checkInFrequency);
        
        const { error: checkinError } = await supabase
          .from('death_verification_checkins')
          .insert({
            user_id: requestData.user_id,
            status: 'alive' as CheckinStatus,
            checked_in_at: now.toISOString(),
            next_check_in: nextCheckIn.toISOString()
          });
        
        if (checkinError) {
          throw checkinError;
        }
      }
    } else {
      const { data: request } = await supabase
        .from('death_verification_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();
      
      if (!request) {
        throw new Error('Request not found');
      }
      
      const { data: beneficiaries } = await supabase
        .from('will_beneficiaries')
        .select('id')
        .eq('user_id', request.user_id);
      
      const { data: executors } = await supabase
        .from('will_executors')
        .select('id')
        .eq('user_id', request.user_id);
      
      const { data: responses } = await supabase
        .from('death_verification_responses')
        .select('*')
        .eq('request_id', requestId);
      
      if (!beneficiaries || !executors || !responses) {
        throw new Error('Could not retrieve required data');
      }
      
      const totalPeople = (beneficiaries.length || 0) + (executors.length || 0);
      const deadResponses = responses.filter(r => r.response === 'dead').length;
      
      if (deadResponses === totalPeople) {
        const { error: updateError } = await supabase
          .from('death_verification_requests')
          .update({ status: 'verified' as VerificationRequestStatus })
          .eq('id', requestId);
        
        if (updateError) {
          throw updateError;
        }
        
        await logVerificationEvent('death_verified', {
          request_id: requestId,
          total_responses: responses.length
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in processVerificationResponse:', error);
    return false;
  }
};

export const logVerificationEvent = async (action: string, details: Record<string, any>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }
    
    const { error } = await supabase
      .from('death_verification_logs')
      .insert({
        user_id: user.id,
        action,
        details: details as Json,
        timestamp: new Date().toISOString()
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
