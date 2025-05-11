
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { 
  generateTrustedContactEmailTemplate, 
  generatePlainTextTrustedContactEmail 
} from '@/utils/emailTemplates';

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
      invitation_status: 'not_sent'
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

export const sendInformationalEmail = async (contactId: string): Promise<boolean> => {
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
    
    // Update the contact status to 'delivered' immediately
    await supabase
      .from('trusted_contacts')
      .update({
        invitation_sent_at: new Date().toISOString(),
        invitation_status: 'delivered',
        invitation_responded_at: new Date().toISOString()
      })
      .eq('id', contactId);
      
    // Prepare the email content with trusted contact template
    const baseUrl = window.location.origin;
    
    // Attempt to send the email
    try {
      // Use send-contact-invitation with informational flag
      const emailResponse = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_PUBLISHABLE_KEY || ''
        },
        body: JSON.stringify({
          contact: {
            contactId,
            contactType: 'trusted',
            name: contact.name,
            email: contact.email,
            userId: session.user.id,
            userFullName
          },
          emailDetails: {
            subject: `Important: Information about your role as ${userFullName}'s trusted contact`,
            isInformationalOnly: true,
            priority: 'high'
          }
        })
      });
      
      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('Error from email edge function:', errorData);
        throw new Error('Edge function error');
      }
      
      return true;
    } catch (fetchError) {
      console.error('Error sending email:', fetchError);
      
      // Try direct functions invoke as a fallback
      try {
        const { data, error: fnError } = await supabase.functions.invoke('send-contact-invitation', {
          body: {
            contact: {
              contactId,
              contactType: 'trusted',
              name: contact.name,
              email: contact.email,
              userId: session.user.id,
              userFullName
            },
            emailDetails: {
              subject: `Important: Information about your role as ${userFullName}'s trusted contact`,
              isInformationalOnly: true,
              priority: 'high'
            }
          }
        });
        
        if (fnError) {
          console.error('Error from functions.invoke:', fnError);
          throw new Error('Functions invoke error');
        }
        
        return true;
      } catch (invokeError) {
        console.error('Error with functions.invoke:', invokeError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error in sendInformationalEmail:', error);
    return false;
  }
};

// Legacy method kept for backward compatibility
export const sendVerificationRequest = async (contactId: string): Promise<boolean> => {
  // Call the new method instead
  return await sendInformationalEmail(contactId);
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
    // Reset invitation status
    await supabase
      .from('trusted_contacts')
      .update({
        invitation_status: 'not_sent',
        invitation_sent_at: null,
        invitation_responded_at: null
      })
      .eq('id', contactId);
      
    return await sendInformationalEmail(contactId);
  } catch (error) {
    console.error('Error in resendInvitation:', error);
    return false;
  }
};
