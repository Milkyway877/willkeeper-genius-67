import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { sendContactWelcomeNotification } from './contactNotificationService';

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  verification_code_word: string;
  is_executor?: boolean;
  executor_2fa_code?: string | null;
  invitation_status?: string | null;
  invitation_sent_at?: string | null;
  invitation_responded_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const getTrustedContacts = async (): Promise<TrustedContact[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trusted contacts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTrustedContacts:', error);
    return [];
  }
};

export const createTrustedContact = async (contact: {
  name: string;
  email: string;
  phone: string;
  address: string;
  verification_code_word: string;
  is_executor?: boolean;
}): Promise<TrustedContact | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }

    // ISSUE FOUND: This query is missing full_name field
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name, email')
      .eq('id', session.user.id)
      .single();

    // ISSUE FOUND: The fallback logic is inadequate
    const userFullName = userProfile?.full_name ||
      (userProfile?.first_name && userProfile?.last_name ?
        `${userProfile.first_name} ${userProfile.last_name}` : 
        session.user.user_metadata?.full_name ||
        session.user.email?.split('@')[0] ||
        'A WillTank user');

    console.log('User profile data for trusted contact creation:', {
      userProfile,
      userFullName,
      sessionUserMetadata: session.user.user_metadata
    });

    const newContact: any = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      verification_code_word: contact.verification_code_word,
      is_executor: !!contact.is_executor,
      user_id: session.user.id,
      invitation_status: 'notified',
      invitation_sent_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert(newContact)
      .select()
      .single();

    if (error) {
      console.error('Error creating trusted contact:', error);
      return null;
    }

    // Send welcome notification with proper user data
    if (data && userProfile) {
      try {
        await sendContactWelcomeNotification({
          contactId: data.id,
          contactName: contact.name,
          contactEmail: contact.email,
          contactType: 'trusted_contact',
          userFullName,
          userEmail: userProfile.email || session.user.email || ''
        });
        console.log('Welcome notification sent to trusted contact with user name:', userFullName);
      } catch (welcomeError) {
        console.error('Error sending automatic welcome notification:', welcomeError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error in createTrustedContact:', error);
    return null;
  }
};

export const updateTrustedContact = async (id: string, updates: Partial<TrustedContact>): Promise<TrustedContact | null> => {
  try {
    const { data, error } = await supabase
      .from('trusted_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating trusted contact:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTrustedContact:', error);
    return null;
  }
};

export const deleteTrustedContact = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('trusted_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting trusted contact:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTrustedContact:', error);
    return false;
  }
};

// Enhanced sendVerificationRequest to use the auto-contact-notifier system
export const sendVerificationRequest = async (contactId: string): Promise<boolean> => {
  try {
    // Get contact details
    const { data: contact, error: contactError } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      console.error('Error fetching contact:', contactError);
      return false;
    }

    // Get auth session for auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('No authenticated user found');
      return false;
    }

    // ISSUE FOUND: This query is also missing proper fallback handling
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name, email')
      .eq('id', session.user.id)
      .single();

    // IMPROVED: Better fallback logic with more detailed logging
    const userFullName = userProfile?.full_name ||
      (userProfile?.first_name && userProfile?.last_name ?
        `${userProfile.first_name} ${userProfile.last_name}` : 
        session.user.user_metadata?.full_name ||
        session.user.email?.split('@')[0] ||
        'A WillTank user');

    console.log('User data for verification request:', {
      userProfile,
      userFullName,
      sessionUserMetadata: session.user.user_metadata,
      sessionEmail: session.user.email
    });

    // Update the contact status first
    try {
      await supabase
        .from('trusted_contacts')
        .update({
          invitation_sent_at: new Date().toISOString(),
          invitation_status: 'pending'
        })
        .eq('id', contactId);
    } catch (updateError) {
      console.error('Error updating contact status:', updateError);
      // Continue anyway
    }

    // Use the auto-contact-notifier function with improved data
    try {
      console.log('Sending verification via auto-contact-notifier with user name:', userFullName);

      const { data, error: fnError } = await supabase.functions.invoke('auto-contact-notifier', {
        body: {
          action: 'welcome_contact',
          contact: {
            contactId: contact.id,
            contactType: 'trusted_contact',
            name: contact.name,
            email: contact.email,
            userId: session.user.id,
            userFullName,
            userEmail: userProfile?.email || session.user.email || '',
            additionalInfo: {
              relation: contact.relation || 'Trusted Contact',
              phone: contact.phone
            }
          }
        }
      });

      if (fnError) {
        console.error('Error from auto-contact-notifier:', fnError);
        return false;
      }

      console.log('Verification sent successfully via auto-contact-notifier');
      return true;
    } catch (invokeError) {
      console.error('Error with auto-contact-notifier:', invokeError);
      return false;
    }
  } catch (error) {
    console.error('Error in sendVerificationRequest:', error);
    return false;
  }
};

// Method to check invitation status
export const checkInvitationStatus = async (contactId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('invitation_status, invitation_sent_at, invitation_responded_at')
      .eq('id', contactId)
      .single();

    if (error || !data) {
      console.error('Error checking invitation status:', error);
      return 'unknown';
    }

    return data.invitation_status || 'not_sent';
  } catch (error) {
    console.error('Error in checkInvitationStatus:', error);
    return 'error';
  }
};

// Method to resend an invitation
export const resendInvitation = async (contactId: string): Promise<boolean> => {
  try {
    // Get contact details first
    const { data: contact, error: contactError } = await supabase
      .from('trusted_contacts')
      .select('name, email')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      console.error('Error fetching contact for resend:', contactError);
      return false;
    }

    // Reset invitation status
    await supabase
      .from('trusted_contacts')
      .update({
        invitation_status: 'pending',
        invitation_sent_at: null
      })
      .eq('id', contactId);

    // Use sendVerificationRequest which now uses auto-contact-notifier
    return await sendVerificationRequest(contactId);
  } catch (error) {
    console.error('Error in resendInvitation:', error);
    return false;
  }
};

// Interface for status check response
interface StatusCheckResponse {
  success: boolean;
  error?: string;
  stats?: {
    total?: number;
    successful?: number;
    failed?: number;
  };
}

// Enhanced triggerStatusCheck to use the new automated system
export const triggerStatusCheck = async (): Promise<{ success: boolean; error?: string; stats?: any }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error('No authenticated user found');
      return { success: false, error: 'Not authenticated' };
    }

    // Use the new automated missed checkin notifications function
    try {
      console.log('Triggering automated missed checkin notifications');
      const { data, error: fnError } = await supabase.functions.invoke('send-missed-checkin-notifications', {
        body: { 
          userId: session.user.id,
          action: 'process_user',
          daysOverdue: 1
        }
      });

      if (fnError) {
        console.error('Error from functions.invoke:', fnError);
        throw new Error(fnError.message || 'Failed to trigger notifications');
      }

      return { 
        success: true, 
        stats: {
          total: 1,
          successful: data?.success ? 1 : 0,
          failed: data?.success ? 0 : 1
        }
      };
    } catch (invokeError) {
      console.error('Error with automated notifications:', invokeError);
      return { success: false, error: invokeError instanceof Error ? invokeError.message : 'Unknown error' };
    }
  } catch (error) {
    console.error('Error in triggerStatusCheck:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
