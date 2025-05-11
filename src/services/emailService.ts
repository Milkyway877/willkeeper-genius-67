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
    
    // Try multiple methods to ensure delivery
    const methods = [
      sendViaEdgeFunction,
      sendViaFunctionsInvoke,
      sendViaNotificationEmail
    ];
    
    let lastError = '';
    
    // Try each method in sequence until one succeeds
    for (const method of methods) {
      try {
        const result = await method(options, session.access_token);
        if (result.success) {
          console.log(`Email sent successfully via ${method.name}`);
          return result;
        } else {
          console.warn(`Email delivery failed via ${method.name}: ${result.error}`);
          lastError = result.error || 'Unknown error';
        }
      } catch (methodError) {
        console.warn(`Exception in ${method.name}:`, methodError);
        lastError = methodError instanceof Error ? methodError.message : 'Unknown error';
      }
    }
    
    // If we get here, all methods failed
    console.error('All email delivery methods failed. Last error:', lastError);
    return { success: false, error: `All delivery methods failed. Last error: ${lastError}` };
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Method 1: Try the standard edge function
async function sendViaEdgeFunction(options: EmailOptions, token: string): Promise<{ success: boolean; emailId?: string; error?: string }> {
  const response = await fetch(`${window.location.origin}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_PUBLISHABLE_KEY || ''
    },
    body: JSON.stringify(options)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to send email (HTTP ${response.status})`);
  }
  
  const data = await response.json();
  return { success: true, emailId: data.emailId };
}

// Method 2: Try Supabase functions.invoke
async function sendViaFunctionsInvoke(options: EmailOptions): Promise<{ success: boolean; emailId?: string; error?: string }> {
  const { data, error: fnError } = await supabase.functions.invoke('send-email', {
    body: options
  });
  
  if (fnError || !data?.success) {
    throw new Error(fnError?.message || data?.error || 'Failed to send email via functions invoke');
  }
  
  return { success: true, emailId: data.emailId };
}

// Method 3: Try our new notification email function as last resort
async function sendViaNotificationEmail(options: EmailOptions, token: string): Promise<{ success: boolean; emailId?: string; error?: string }> {
  // Convert EmailOptions to the format expected by send-notification-email
  const to = Array.isArray(options.to) ? options.to[0] : options.to;
  
  const response = await fetch(`${window.location.origin}/functions/v1/send-notification-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_PUBLISHABLE_KEY || ''
    },
    body: JSON.stringify({
      to,
      subject: options.subject,
      content: options.htmlContent || "No content provided.",
      priority: options.priority || 'normal',
      contentType: 'notification',
      emailType: 'system'
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Notification email failed (HTTP ${response.status})`);
  }
  
  const data = await response.json();
  return { success: true, emailId: data.emailId };
}

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
        console.error('Error sending trusted contact invitation:', errorData);
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
