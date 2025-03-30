
import { supabase } from "@/integrations/supabase/client";
import { createSystemNotification } from "./notificationService";

// Types for Death Verification functionality
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
  failsafe_enabled: boolean;
  trusted_contact_email?: string;
  unlock_mode: UnlockMode;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_SETTINGS: DeathVerificationSettings = {
  id: '',
  user_id: '',
  check_in_enabled: true,
  check_in_frequency: 30,
  beneficiary_verification_interval: 48,
  notification_preferences: {
    email: true,
    sms: false,
    push: false
  },
  failsafe_enabled: true,
  unlock_mode: 'pin'
};

// Get death verification settings for the current user
export async function getDeathVerificationSettings(): Promise<DeathVerificationSettings | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user found when fetching death verification settings');
      return null;
    }
    
    const { data, error } = await supabase
      .from('death_verification_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No record found, return default settings
        console.log('No death verification settings found, using defaults');
        return null;
      }
      
      console.error('Error fetching death verification settings:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDeathVerificationSettings:', error);
    return null;
  }
}

// Save or update death verification settings
export async function saveDeathVerificationSettings(
  settings: DeathVerificationSettings
): Promise<DeathVerificationSettings | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user found when saving death verification settings');
      return null;
    }
    
    // Prepare settings data with user ID
    const settingsData = {
      ...settings,
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    };
    
    let response;
    
    if (settings.id) {
      // Update existing settings
      response = await supabase
        .from('death_verification_settings')
        .update(settingsData)
        .eq('id', settings.id)
        .select();
    } else {
      // Create new settings
      response = await supabase
        .from('death_verification_settings')
        .insert({
          ...settingsData,
          created_at: new Date().toISOString()
        })
        .select();
    }
    
    if (response.error) {
      console.error('Error saving death verification settings:', response.error);
      return null;
    }
    
    if (response.data && response.data.length > 0) {
      await createSystemNotification('success', {
        title: 'Death Verification Settings Updated',
        description: 'Your death verification settings have been saved successfully.'
      });
      
      return response.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error in saveDeathVerificationSettings:', error);
    return null;
  }
}

// Add an executor with email confirmation
export async function addExecutor(email: string, name?: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user found when adding executor');
      return false;
    }
    
    // Call the edge function to send a confirmation email
    const { data, error } = await supabase.functions.invoke('send-confirmation', {
      body: { 
        userId: session.user.id, 
        email,
        name,
        type: 'executor'
      }
    });
    
    if (error) {
      console.error('Error adding executor:', error);
      return false;
    }
    
    await createSystemNotification('info', {
      title: 'Executor Confirmation Sent',
      description: `An email has been sent to ${email} to confirm their role as an executor.`
    });
    
    return true;
  } catch (error) {
    console.error('Error in addExecutor:', error);
    return false;
  }
}

// Add a beneficiary with email confirmation
export async function addBeneficiary(email: string, name?: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user found when adding beneficiary');
      return false;
    }
    
    // Call the edge function to send a confirmation email
    const { data, error } = await supabase.functions.invoke('send-confirmation', {
      body: { 
        userId: session.user.id, 
        email,
        name,
        type: 'beneficiary'
      }
    });
    
    if (error) {
      console.error('Error adding beneficiary:', error);
      return false;
    }
    
    await createSystemNotification('info', {
      title: 'Beneficiary Confirmation Sent',
      description: `An email has been sent to ${email} to confirm their role as a beneficiary.`
    });
    
    return true;
  } catch (error) {
    console.error('Error in addBeneficiary:', error);
    return false;
  }
}

// Confirm role (executor or beneficiary) using token
export async function confirmRole(token: string, type: 'executor' | 'beneficiary'): Promise<boolean> {
  try {
    // Determine which table to use
    const table = type === 'executor' ? 'executors' : 'beneficiaries';
    
    // Update the status to confirmed
    const { error } = await supabase
      .from(table)
      .update({ status: 'confirmed' })
      .eq('confirmation_token', token);
    
    if (error) {
      console.error(`Error confirming ${type}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in confirmRole:', error);
    return false;
  }
}

// Decline role (executor or beneficiary) using token
export async function declineRole(token: string, type: 'executor' | 'beneficiary'): Promise<boolean> {
  try {
    // Determine which table to use
    const table = type === 'executor' ? 'executors' : 'beneficiaries';
    
    // Update the status to declined
    const { error } = await supabase
      .from(table)
      .update({ status: 'declined' })
      .eq('confirmation_token', token);
    
    if (error) {
      console.error(`Error declining ${type}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in declineRole:', error);
    return false;
  }
}

// Send check-in emails to all confirmed executors
export async function sendCheckInEmails(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user found when sending check-in emails');
      return false;
    }
    
    // Get user profile for name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .single();
    
    const userName = profile?.full_name || session.user.email;
    
    // Get all confirmed executors
    const { data: executors, error: executorsError } = await supabase
      .from('executors')
      .select('email, name')
      .eq('user_id', session.user.id)
      .eq('status', 'confirmed');
    
    if (executorsError) {
      console.error('Error fetching executors:', executorsError);
      return false;
    }
    
    if (!executors || executors.length === 0) {
      console.warn('No confirmed executors found');
      return false;
    }
    
    // Send check-in emails to all executors
    const emailPromises = executors.map(async (executor) => {
      return supabase.functions.invoke('send-checkin', {
        body: { 
          userId: session.user.id, 
          executorEmail: executor.email,
          executorName: executor.name,
          userName
        }
      });
    });
    
    await Promise.all(emailPromises);
    
    await createSystemNotification('info', {
      title: 'Check-in Emails Sent',
      description: `Check-in emails have been sent to ${executors.length} executor(s).`
    });
    
    return true;
  } catch (error) {
    console.error('Error in sendCheckInEmails:', error);
    return false;
  }
}

// Update check-in status based on executor response
export async function updateCheckInStatus(
  userId: string, 
  executorEmail: string, 
  status: 'alive' | 'dead'
): Promise<boolean> {
  try {
    // Update the status in the user_checkins table
    const { data: existingCheckin } = await supabase
      .from('user_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('executor_email', executorEmail)
      .single();
    
    if (existingCheckin) {
      await supabase
        .from('user_checkins')
        .update({ 
          status,
          last_checkin: new Date().toISOString()
        })
        .eq('id', existingCheckin.id);
    } else {
      await supabase
        .from('user_checkins')
        .insert({
          user_id: userId,
          executor_email: executorEmail,
          status,
          last_checkin: new Date().toISOString()
        });
    }
    
    // If the user is declared dead, send will access instructions to executors
    if (status === 'dead') {
      await supabase.functions.invoke('send-will-access', {
        body: { 
          userId,
          deceased: true
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateCheckInStatus:', error);
    return false;
  }
}

// Get all executors for the current user
export async function getExecutors() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user found when fetching executors');
      return [];
    }
    
    const { data, error } = await supabase
      .from('executors')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error fetching executors:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getExecutors:', error);
    return [];
  }
}

// Get all beneficiaries for the current user
export async function getBeneficiaries() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user found when fetching beneficiaries');
      return [];
    }
    
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getBeneficiaries:', error);
    return [];
  }
}
