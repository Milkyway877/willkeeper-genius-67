
import { supabase } from '@/integrations/supabase/client';
import * as directEmailService from '@/services/directEmailService';

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
    
    // Create the check-in record - Changed 'active' to 'alive'
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
    
    // Get user profile info
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', session.user.id)
      .single();
    
    if (userError || !userProfile) {
      console.error('Error fetching user profile:', userError);
      throw new Error("User profile not found");
    }
    
    const userFullName = userProfile.full_name || 
      (userProfile.first_name && userProfile.last_name 
        ? `${userProfile.first_name} ${userProfile.last_name}` 
        : 'A WillTank user');
    
    // Get all contacts for this user
    interface Contact {
      id: string;
      type: 'beneficiary' | 'executor' | 'trusted';
      name: string;
      email: string;
    }
    
    const contacts: Contact[] = [];
    
    // Get beneficiaries
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .select('id, beneficiary_name, email')
      .eq('user_id', session.user.id)
      .not('email', 'is', null);
    
    if (beneficiariesError) {
      console.error('Error fetching beneficiaries:', beneficiariesError);
    }
    
    if (!beneficiariesError && beneficiaries) {
      beneficiaries.forEach(b => {
        contacts.push({
          id: b.id,
          type: 'beneficiary',
          name: b.beneficiary_name,
          email: b.email
        });
      });
    }
    
    // Get executors
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('id, name, email')
      .eq('user_id', session.user.id)
      .not('email', 'is', null);
    
    if (executorsError) {
      console.error('Error fetching executors:', executorsError);
    }
    
    if (!executorsError && executors) {
      executors.forEach(e => {
        contacts.push({
          id: e.id,
          type: 'executor',
          name: e.name,
          email: e.email
        });
      });
    }
    
    // Get trusted contacts
    const { data: trustedContacts, error: trustedError } = await supabase
      .from('trusted_contacts')
      .select('id, name, email')
      .eq('user_id', session.user.id);
    
    if (trustedError) {
      console.error('Error fetching trusted contacts:', trustedError);
    }
    
    if (!trustedError && trustedContacts) {
      trustedContacts.forEach(t => {
        contacts.push({
          id: t.id,
          type: 'trusted',
          name: t.name,
          email: t.email
        });
      });
    }
    
    if (contacts.length === 0) {
      console.log('No contacts found for user:', session.user.id);
      return false;
    }
    
    console.log(`Found ${contacts.length} contacts for status check`);
    
    // Get the base URL for verification links
    const baseUrl = window.location.origin;
    
    // Send status check emails to all contacts
    const results = await Promise.all(contacts.map(async (contact) => {
      try {
        // Generate a verification token
        const verificationToken = await directEmailService.createVerificationToken(
          session.user.id,
          contact.id,
          contact.type as 'beneficiary' | 'executor' | 'trusted',
          'status'
        );
        
        if (!verificationToken) {
          return { success: false, contact, error: "Failed to create verification token" };
        }
        
        // Generate email content
        const emailTemplate = directEmailService.generateStatusCheckEmail(
          {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            type: contact.type as 'beneficiary' | 'executor' | 'trusted'
          },
          userFullName,
          verificationToken,
          baseUrl
        );
        
        // Send the email
        const emailResult = await directEmailService.sendEmail(
          contact.email,
          emailTemplate.subject,
          emailTemplate.html,
          'WillTank Status Check <verify@willtank.com>'
        );
        
        if (!emailResult.success) {
          console.error(`Error sending status check to ${contact.email}:`, emailResult.error);
          return { success: false, contact, error: emailResult.error };
        }
        
        console.log(`Successfully sent status check to ${contact.email}`);
        
        // Log the status check
        await supabase.from('death_verification_logs').insert({
          user_id: session.user.id,
          action: 'status_check_sent',
          details: {
            contact_id: contact.id,
            contact_type: contact.type,
            contact_name: contact.name,
            contact_email: contact.email,
            email_id: emailResult.emailId,
          }
        });
        
        return { success: true, contact, emailId: emailResult.emailId };
      } catch (error) {
        console.error(`Error sending status check to ${contact.email}:`, error);
        return { success: false, contact, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }));
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Status check complete: ${successful} successful, ${failed} failed`);
    
    return successful > 0;
  } catch (error) {
    console.error("Error sending status check emails:", error);
    throw error;
  }
};

// New function to send invitation email to trusted contact
export const sendTrustedContactInvitation = async (
  contactId: string,
  contactName: string,
  contactEmail: string,
  customMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current authenticated session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return { success: false, error: 'Not authenticated' };
    }
    
    // Get user profile for name
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', session.user.id)
      .single();
      
    const userFullName = userProfile?.full_name || 
      (userProfile?.first_name && userProfile?.last_name ? 
        `${userProfile.first_name} ${userProfile.last_name}` : 'A WillTank user');
    
    // First mark the contact as having an invitation sent 
    await supabase
      .from('trusted_contacts')
      .update({
        invitation_sent_at: new Date().toISOString(),
        invitation_status: 'sent'
      })
      .eq('id', contactId);
    
    // Create verification token
    const verificationToken = await directEmailService.createVerificationToken(
      session.user.id,
      contactId,
      'trusted',
      'invitation'
    );
    
    if (!verificationToken) {
      return { success: false, error: 'Failed to create verification token' };
    }
    
    // Get the base URL for verification links
    const baseUrl = window.location.origin;
    
    // Generate email content
    const emailTemplate = directEmailService.generateInvitationEmail(
      {
        id: contactId,
        name: contactName,
        email: contactEmail,
        type: 'trusted'
      },
      userFullName,
      verificationToken,
      baseUrl,
      customMessage
    );
    
    // Send the email
    const emailResult = await directEmailService.sendEmail(
      contactEmail,
      emailTemplate.subject,
      emailTemplate.html,
      'WillTank Trusted Contact <trusted@willtank.com>'
    );
    
    if (!emailResult.success) {
      console.error(`Error sending invitation to ${contactEmail}:`, emailResult.error);
      return { success: false, error: emailResult.error };
    }
    
    // Log the invitation sent
    await supabase.from('death_verification_logs').insert({
      user_id: session.user.id,
      action: 'trusted_contact_invitation_sent',
      details: {
        contact_id: contactId,
        contact_name: contactName,
        contact_email: contactEmail,
        email_id: emailResult.emailId,
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error in sendTrustedContactInvitation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
