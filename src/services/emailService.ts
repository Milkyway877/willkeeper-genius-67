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
      // Direct function invocation - more reliable than fetch
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
      
      // Try using fetch as fallback
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
        return { 
          success: false, 
          error: fetchError instanceof Error ? fetchError.message : 'Unknown error with email delivery'
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
    console.log(`Sending invitation to ${contactName} (${contactEmail})`);
    
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
    try {
      const { error: updateError } = await supabase
        .from('trusted_contacts')
        .update({
          invitation_sent_at: new Date().toISOString(),
          invitation_status: 'sent'
        })
        .eq('id', contactId);
        
      if (updateError) {
        console.error('Error updating contact status:', updateError);
        // Continue anyway - we still want to try sending the email
      } else {
        console.log('Contact status updated successfully');
      }
    } catch (updateError) {
      console.error('Exception updating contact status:', updateError);
      // Continue anyway
    }
    
    // Prepare request data
    const requestData = {
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
        includeVerificationInstructions: false, // Make it informational, not requiring action
        includeUserBio: true,
        priority: 'high',
        customMessage
      }
    };
      
    // Try direct functions invoke first - most reliable method
    try {
      console.log('Attempting to send invitation via direct function invoke');
      
      const { data, error: fnError } = await supabase.functions.invoke('send-contact-invitation', {
        body: requestData
      });
      
      if (fnError) {
        console.error('Error from functions.invoke:', fnError);
        throw new Error(fnError.message || 'Failed to send invitation via functions invoke');
      }
      
      if (!data?.success) {
        console.error('Function returned error:', data?.error);
        throw new Error(data?.error || 'Function returned error status');
      }
      
      console.log('Invitation sent successfully via function invoke');
      return { success: true };
    } catch (invokeError) {
      console.error('Error with functions.invoke:', invokeError);
      
      // Try fetch as fallback
      try {
        console.log('Attempting to send invitation via fetch');
        
        const response = await fetch(`${window.location.origin}/functions/v1/send-contact-invitation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_PUBLISHABLE_KEY || ''
          },
          body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error sending trusted contact invitation:', errorData);
          throw new Error(errorData.message || 'Failed to send invitation');
        }
        
        const responseData = await response.json();
        console.log('Invitation sent successfully via fetch:', responseData);
        return { success: true };
      } catch (fetchError) {
        console.error('Fetch error with send-contact-invitation:', fetchError);
        throw new Error('All methods to send invitation failed');
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
    console.log(`Sending reminder for contact ID: ${contactId}`);
    
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
      customMessage || "This is a reminder about your trusted contact role."
    );
  } catch (error) {
    console.error('Error in sendReminderToTrustedContact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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

// Function to trigger a status check for a user
export const triggerStatusCheck = async (userId: string): Promise<StatusCheckResponse> => {
  try {
    console.log(`Triggering status check for user: ${userId}`);
    
    // Get current authenticated session (if needed for authorization)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('No authenticated user found');
      return { success: false, error: 'Not authenticated' };
    }
    
    // Try direct functions invoke first
    try {
      console.log('Attempting status check via direct invoke');
      const { data, error: fnError } = await supabase.functions.invoke('send-status-check', {
        body: { userId }
      });
      
      if (fnError) {
        console.error('Error from functions.invoke:', fnError);
        throw new Error(fnError.message || 'Failed to send status check via functions invoke');
      }
      
      if (!data?.success) {
        console.error('Function returned error:', data?.error);
        throw new Error(data?.error || 'Function returned error status');
      }
      
      console.log('Status check triggered successfully via function invoke');
      return { 
        success: true, 
        stats: data.stats
      };
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
          body: JSON.stringify({ userId })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error sending status check:', errorData);
          throw new Error(errorData.message || 'Failed to send status check');
        }
        
        const responseData = await response.json();
        console.log('Status check triggered successfully via fetch:', responseData);
        return { 
          success: true, 
          stats: responseData.stats 
        };
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
