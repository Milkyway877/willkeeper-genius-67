import { supabase } from '@/integrations/supabase/client';

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

// Enhanced user name fetching function
const getUserFullName = async (userId: string): Promise<string> => {
  try {
    // First try to get from auth.users metadata
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id === userId) {
      const metadata = authData.user.user_metadata;
      
      // Try full_name from metadata first
      if (metadata?.full_name) {
        return metadata.full_name;
      }
      
      // Try first_name + last_name from metadata
      if (metadata?.first_name || metadata?.last_name) {
        return `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim();
      }
      
      // Use email as fallback
      if (authData.user.email) {
        return authData.user.email.split('@')[0];
      }
    }
    
    // Fallback to user_profiles table
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', userId)
      .single();

    if (userProfile?.full_name) {
      return userProfile.full_name;
    } else if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    } else if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    
    return 'WillTank User';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'WillTank User';
  }
};

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

    // Get enhanced user full name
    const userFullName = await getUserFullName(session.user.id);
    console.log('Creating trusted contact with enhanced user full name:', userFullName);

    const newContact: any = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      verification_code_word: contact.verification_code_word,
      is_executor: !!contact.is_executor,
      user_id: session.user.id,
      invitation_status: 'sending',
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

    // ONLY use the auto-contact-notifier edge function - no more conflicts!
    if (data) {
      try {
        console.log('Sending welcome notification via auto-contact-notifier...');
        console.log('Enhanced user data being sent:', {
          userFullName,
          userEmail: session.user.email
        });

        const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('auto-contact-notifier', {
          body: {
            action: 'welcome_contact',
            contact: {
              contactId: data.id,
              contactType: 'trusted_contact',
              name: contact.name,
              email: contact.email,
              userId: session.user.id,
              userFullName: userFullName,
              userEmail: session.user.email || ''
            }
          }
        });

        if (notificationError) {
          console.error('Error sending welcome notification:', notificationError);
          // Update status to indicate email failed
          await supabase
            .from('trusted_contacts')
            .update({ invitation_status: 'failed' })
            .eq('id', data.id);
        } else {
          console.log('Welcome notification sent successfully:', notificationResult);
          // Update status to indicate email was sent
          await supabase
            .from('trusted_contacts')
            .update({ invitation_status: 'sent' })
            .eq('id', data.id);
        }
      } catch (welcomeError) {
        console.error('Error with auto-contact-notifier:', welcomeError);
        // Update status to indicate email failed
        await supabase
          .from('trusted_contacts')
          .update({ invitation_status: 'failed' })
          .eq('id', data.id);
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

// Enhanced sendVerificationRequest to use ONLY the auto-contact-notifier system
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

    // Get enhanced user full name
    const userFullName = await getUserFullName(session.user.id);
    console.log('Sending verification with enhanced user full name:', userFullName);

    // Update the contact status first
    try {
      await supabase
        .from('trusted_contacts')
        .update({
          invitation_sent_at: new Date().toISOString(),
          invitation_status: 'sending'
        })
        .eq('id', contactId);
    } catch (updateError) {
      console.error('Error updating contact status:', updateError);
      // Continue anyway
    }

    // Use ONLY the auto-contact-notifier function
    try {
      console.log('Sending verification via auto-contact-notifier with enhanced name');

      const { data, error: fnError } = await supabase.functions.invoke('auto-contact-notifier', {
        body: {
          action: 'welcome_contact',
          contact: {
            contactId: contact.id,
            contactType: 'trusted_contact',
            name: contact.name,
            email: contact.email,
            userId: session.user.id,
            userFullName: userFullName,
            userEmail: session.user.email || ''
          }
        }
      });

      if (fnError) {
        console.error('Error from auto-contact-notifier:', fnError);
        // Update status to failed
        await supabase
          .from('trusted_contacts')
          .update({ invitation_status: 'failed' })
          .eq('id', contactId);
        return false;
      }

      // Update status to sent
      await supabase
        .from('trusted_contacts')
        .update({ invitation_status: 'sent' })
        .eq('id', contactId);

      console.log('Verification sent successfully via auto-contact-notifier with enhanced name');
      return true;
    } catch (invokeError) {
      console.error('Error with auto-contact-notifier:', invokeError);
      // Update status to failed
      await supabase
        .from('trusted_contacts')
        .update({ invitation_status: 'failed' })
        .eq('id', contactId);
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
