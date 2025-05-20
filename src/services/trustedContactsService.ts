import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { sendTrustedContactInvitation } from './emailService';

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string | null;
  relation?: string | null;
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
}): Promise<TrustedContact | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return null;
    }
    
    const newContact = {
      name: contact.name,
      email: contact.email,
      user_id: session.user.id,
      invitation_status: 'pending'
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

// Send verification request using the trusted contact invitation service
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
    
    // Get user profile for name
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name')
      .eq('id', session.user.id)
      .single();
      
    const userFullName = userProfile?.full_name || 
      (userProfile?.first_name && userProfile?.last_name ? 
        `${userProfile.first_name} ${userProfile.last_name}` : 'A WillTank user');
    
    // Try using the emailService function first
    try {
      console.log('Sending verification request via emailService');
      const result = await sendTrustedContactInvitation(
        contactId,
        contact.name,
        contact.email
      );
      
      if (result.success) {
        console.log('Verification request sent successfully via emailService');
        return true;
      } else {
        console.error('emailService failed, trying direct methods');
        throw new Error(result.error || 'emailService failed');
      }
    } catch (emailServiceError) {
      console.error('Error with emailService:', emailServiceError);
      
      // Direct fallback - update the contact status first
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
      
      // Try direct function invocation
      try {
        console.log('Attempting to send verification via direct invoke');
        
        const { data, error: fnError } = await supabase.functions.invoke('send-contact-invitation', {
          body: {
            contact: {
              contactId: contact.id,
              contactType: 'trusted',
              name: contact.name,
              email: contact.email,
              userId: session.user.id,
              userFullName
            },
            emailDetails: {
              subject: `Important: ${userFullName} has named you as a trusted contact`,
              includeVerificationInstructions: false,
              includeUserBio: true,
              priority: 'high'
            }
          }
        });
        
        if (fnError) {
          console.error('Error from functions.invoke:', fnError);
          throw new Error('Functions invoke error');
        }
        
        console.log('Verification sent successfully via direct invoke');
        return true;
      } catch (invokeError) {
        console.error('Error with direct invoke:', invokeError);
        
        // Try fetch as final fallback
        try {
          console.log('Attempting to send verification via fetch');
          
          const response = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': SUPABASE_PUBLISHABLE_KEY || ''
            },
            body: JSON.stringify({
              contact: {
                contactId: contact.id,
                contactType: 'trusted',
                name: contact.name,
                email: contact.email,
                userId: session.user.id,
                userFullName
              },
              emailDetails: {
                subject: `Important: ${userFullName} has named you as a trusted contact`,
                includeVerificationInstructions: false,
                includeUserBio: true,
                priority: 'high'
              }
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from fetch:', errorData);
            throw new Error('Fetch error');
          }
          
          console.log('Verification sent successfully via fetch');
          return true;
        } catch (fetchError) {
          console.error('Error with fetch:', fetchError);
          return false;
        }
      }
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
      
    // Use the emailService to send the invitation
    const result = await sendTrustedContactInvitation(
      contactId,
      contact.name,
      contact.email,
      "This is a reminder about your role as a trusted contact."
    );
    
    return result.success;
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

// Method to trigger a status check for all contacts
export const triggerStatusCheck = async (): Promise<StatusCheckResponse> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return { success: false, error: 'Not authenticated' };
    }
    
    // Try direct functions invoke first
    try {
      console.log('Attempting status check via direct invoke');
      const { data, error: fnError } = await supabase.functions.invoke('send-status-check', {
        body: { userId: session.user.id }
      });
      
      if (fnError) {
        console.error('Error from functions.invoke:', fnError);
        throw new Error(fnError.message || 'Failed to send status check via functions invoke');
      }
      
      return { success: true, stats: data?.stats };
    } catch (invokeError) {
      console.error('Error with functions.invoke for status check:', invokeError);
      
      // Try fetch as fallback
      try {
        console.log('Attempting status check via fetch');
        const response = await fetch(`${window.location.origin}/functions/v1/send-status-check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_PUBLISHABLE_KEY || ''
          },
          body: JSON.stringify({ userId: session.user.id })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error sending status check:', errorData);
          throw new Error(errorData.message || 'Failed to send status check');
        }
        
        const responseData = await response.json();
        return { success: true, stats: responseData.stats };
      } catch (fetchError) {
        console.error('Fetch error with send-status-check:', fetchError);
        throw new Error('All methods to trigger status check failed');
      }
    }
  } catch (error) {
    console.error('Error in triggerStatusCheck:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
