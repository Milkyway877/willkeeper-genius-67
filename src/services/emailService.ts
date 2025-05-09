
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  priority?: 'normal' | 'high';
  tags?: Array<{name: string, value: string}>;
}

export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; emailId?: string; error?: string }> => {
  try {
    // Get current authenticated session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return { success: false, error: 'Not authenticated' };
    }
    
    // Call the edge function for sending emails
    try {
      const response = await fetch(`${window.location.origin}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_PUBLISHABLE_KEY || ''
        },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending email:', errorData);
        throw new Error(errorData.message || 'Failed to send email');
      }
      
      const data = await response.json();
      return { success: true, emailId: data.emailId };
    } catch (fetchError) {
      console.error('Error with fetch to send-email:', fetchError);
      
      // Try using supabase functions invoke as fallback
      try {
        const { data, error: fnError } = await supabase.functions.invoke('send-email', {
          body: options
        });
        
        if (fnError || !data?.success) {
          console.error('Error from functions.invoke:', fnError);
          return { 
            success: false, 
            error: fnError?.message || data?.error || 'Failed to send email via functions invoke'
          };
        }
        
        return { success: true, emailId: data.emailId };
      } catch (invokeError) {
        console.error('Error with functions.invoke:', invokeError);
        return { 
          success: false, 
          error: invokeError instanceof Error ? invokeError.message : 'Unknown error with email delivery'
        };
      }
    }
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Send an invitation to a trusted contact
 */
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
    // This ensures we don't lose track even if the email fails
    await supabase
      .from('trusted_contacts')
      .update({
        invitation_sent_at: new Date().toISOString(),
        invitation_status: 'sent'
      })
      .eq('id', contactId);
    
    // Send invitation via edge function with better error handling
    try {
      console.log('Sending invitation to trusted contact with ID:', contactId);
      
      const response = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
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
            name: contactName,
            email: contactEmail,
            userId: session.user.id,
            userFullName
          },
          emailDetails: {
            subject: `Important: ${userFullName} has named you as a trusted contact`,
            includeVerificationInstructions: true,
            includeUserBio: true,
            priority: 'high',
            customMessage
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from invitation edge function:', errorData);
        throw new Error(errorData.message || 'Failed to send invitation');
      }
      
      return { success: true };
    } catch (fetchError) {
      console.error('Fetch error with send-contact-invitation:', fetchError);
      
      // Try direct functions invoke as a fallback
      try {
        const { data, error: fnError } = await supabase.functions.invoke('send-contact-invitation', {
          body: {
            contact: {
              contactId,
              contactType: 'trusted',
              name: contactName,
              email: contactEmail,
              userId: session.user.id,
              userFullName
            },
            emailDetails: {
              subject: `Important: ${userFullName} has named you as a trusted contact`,
              includeVerificationInstructions: true,
              includeUserBio: true,
              priority: 'high',
              customMessage
            }
          }
        });
        
        if (fnError || !data?.success) {
          console.error('Error from functions.invoke:', fnError);
          return { 
            success: false, 
            error: fnError?.message || data?.error || 'Failed to send invitation via functions invoke'
          };
        }
        
        return { success: true };
      } catch (invokeError) {
        console.error('Error with functions.invoke:', invokeError);
        return { 
          success: false, 
          error: invokeError instanceof Error ? invokeError.message : 'Unknown error with invitation'
        };
      }
    }
  } catch (error) {
    console.error('Error in sendTrustedContactInvitation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Send reminder to trusted contact
export const sendReminderToTrustedContact = async (
  contactId: string, 
  customMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get contact details
    const { data: contact, error: contactError } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('id', contactId)
      .single();
      
    if (contactError || !contact) {
      console.error('Error fetching contact:', contactError);
      return { success: false, error: 'Contact not found' };
    }
    
    // Call the main invitation function with reminder flag
    return await sendTrustedContactInvitation(
      contactId, 
      contact.name, 
      contact.email,
      customMessage || "This is a reminder about the invitation that was sent earlier."
    );
  } catch (error) {
    console.error('Error in sendReminderToTrustedContact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
