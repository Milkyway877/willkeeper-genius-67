
import { supabase } from '@/integrations/supabase/client';

// Resend API configuration
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || 're_123456789'; // Replace with your actual key or use ENV
const RESEND_API_URL = 'https://api.resend.com';

export interface EmailRecipient {
  name: string;
  email: string;
  type: 'beneficiary' | 'executor' | 'trusted';
  id: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Generate a verification token and store it in the database
 */
export const createVerificationToken = async (
  userId: string,
  contactId: string,
  contactType: 'beneficiary' | 'executor' | 'trusted',
  tokenType: 'status' | 'invitation' = 'status'
): Promise<string | null> => {
  try {
    // Generate a random token
    const verificationToken = crypto.randomUUID();
    
    // Set expiration date to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from('contact_verifications')
      .insert({
        contact_id: contactId,
        contact_type: contactType,
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString(),
        user_id: userId
      })
      .select()
      .single();
      
    if (verificationError) {
      console.error('Error creating verification token:', verificationError);
      return null;
    }
    
    // Log the verification creation
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: `${tokenType}_verification_created`,
      details: {
        verification_id: verification.id,
        contact_id: contactId,
        contact_type: contactType,
        expires_at: expiresAt.toISOString(),
      }
    });
    
    return verificationToken;
  } catch (error) {
    console.error('Error creating verification token:', error);
    return null;
  }
};

/**
 * Build a standard email layout with WillTank branding
 */
export const buildEmailLayout = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333; }
        .container { padding: 20px; }
        .header { background-color: #4a6cf7; color: white; padding: 20px; text-align: center; }
        .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .content { padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; margin: 10px 5px; border-radius: 4px; text-decoration: none; }
        .green-button { background-color: #10b981; color: white; }
        .red-button { background-color: #ef4444; color: white; }
        .blue-button { background-color: #4a6cf7; color: white; }
        .gray-button { background-color: #f5f5f5; color: #666; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>WillTank</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} WillTank. All rights reserved.<br>
          This is an automated message from WillTank's verification system.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate status check email content
 */
export const generateStatusCheckEmail = (
  recipient: EmailRecipient,
  userFullName: string,
  verificationToken: string,
  baseUrl: string
): EmailTemplate => {
  // Create direct action API URLs (for email buttons)
  const aliveActionUrl = `${baseUrl}/verify/status-response?token=${verificationToken}&response=alive&direct=true`;
  const deceasedActionUrl = `${baseUrl}/verify/status-response?token=${verificationToken}&response=deceased&direct=true`;
  
  // Create verification URL (fallback for when buttons don't work)
  const statusUrl = `${baseUrl}/verify/status/${verificationToken}`;
  
  // Generate email content with direct action buttons
  const content = `
    <h1>Status Check Request</h1>
    <p>Hello ${recipient.name},</p>
    <p>We're reaching out as part of WillTank's regular status check system. ${userFullName} has you listed as a ${recipient.type} in their will.</p>
    <p>We'd like to confirm that ${userFullName} is still alive and well. Please click the appropriate button below:</p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="#10b981">
                <a href="${aliveActionUrl}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; padding: 12px 25px; border: 1px solid #10b981; display: inline-block; font-weight: bold;">YES, STILL ALIVE</a>
              </td>
            </tr>
          </table>
        </td>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="#ef4444">
                <a href="${deceasedActionUrl}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; padding: 12px 25px; border: 1px solid #ef4444; display: inline-block; font-weight: bold;">NO, DECEASED</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 30px;">This is a routine check and part of WillTank's death verification system. Your response helps ensure that ${userFullName}'s will is only accessible at the appropriate time.</p>
    <p>If you're not sure about ${userFullName}'s status, please try to contact them directly before responding.</p>
    <p>If the buttons above don't work, you can also <a href="${statusUrl}">click here</a> to respond.</p>
  `;
  
  return {
    subject: `Status Check for ${userFullName}`,
    html: buildEmailLayout(content),
  };
};

/**
 * Generate invitation email content
 */
export const generateInvitationEmail = (
  recipient: EmailRecipient,
  userFullName: string,
  verificationToken: string,
  baseUrl: string,
  customMessage?: string
): EmailTemplate => {
  // Create direct action API URLs (for email buttons)
  const acceptActionUrl = `${baseUrl}/verify/invitation-response?token=${verificationToken}&response=accept&direct=true`;
  const declineActionUrl = `${baseUrl}/verify/invitation-response?token=${verificationToken}&response=decline&direct=true`;
  
  // Create verification URL (fallback for when buttons don't work)
  const invitationUrl = `${baseUrl}/verify/invitation/${verificationToken}`;
  
  // Set expiration date for display
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Format the expiration date
  const expirationDate = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(expiresAt);
  
  // Generate email content with direct action buttons
  const content = `
    <h1>Important Role Invitation</h1>
    <p>Hello ${recipient.name},</p>
    <p>${userFullName} has named you as a trusted contact in their WillTank account.</p>
    
    ${customMessage ? `<p><em>${customMessage}</em></p>` : ''}
    
    <h2>What does being a trusted contact mean?</h2>
    <p>As a trusted contact, your role is crucial. If ${userFullName} fails to respond to regular check-ins in our system, you may be contacted to confirm their status.</p>
    <p>Your responsibilities include:</p>
    <ul>
      <li>Responding to verification requests if ${userFullName} misses check-ins</li>
      <li>Providing accurate information about ${userFullName}'s status when contacted</li>
      <li>Maintaining confidentiality about your role and any information you receive</li>
    </ul>
    
    <p>Please use the buttons below to accept or decline this role:</p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="#4a6cf7">
                <a href="${acceptActionUrl}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; padding: 12px 25px; border: 1px solid #4a6cf7; display: inline-block; font-weight: bold;">ACCEPT ROLE</a>
              </td>
            </tr>
          </table>
        </td>
        <td align="center">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="#f5f5f5">
                <a href="${declineActionUrl}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #666666; text-decoration: none; border-radius: 5px; padding: 12px 25px; border: 1px solid #ddd; display: inline-block; font-weight: bold;">DECLINE ROLE</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 30px;">This invitation will expire on ${expirationDate}.</p>
    <p>If the buttons above don't work, you can also <a href="${invitationUrl}">click here</a> to respond.</p>
  `;
  
  return {
    subject: `Important: ${userFullName} has named you as a trusted contact`,
    html: buildEmailLayout(content),
  };
};

/**
 * Send an email using Resend API directly
 */
export const sendEmail = async (
  to: string, 
  subject: string, 
  html: string,
  from: string = 'WillTank Verification <verify@willtank.com>'
): Promise<{success: boolean; emailId?: string; error?: string}> => {
  try {
    const response = await fetch(`${RESEND_API_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error sending email with Resend:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email'
      };
    }
    
    return {
      success: true,
      emailId: data.id
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
};

/**
 * Process a verification response
 */
export const processVerificationResponse = async (
  token: string,
  responseType: 'alive' | 'deceased' | 'accept' | 'decline'
): Promise<{success: boolean; message?: string; error?: string}> => {
  try {
    // Find the verification record using the token
    const { data: verificationData, error: verificationError } = await supabase
      .from('contact_verifications')
      .select('*')
      .eq('verification_token', token)
      .single();
      
    if (verificationError || !verificationData) {
      console.error('Error or no verification found:', verificationError);
      return {
        success: false,
        error: "Invalid verification token or expired"
      };
    }
    
    // Check if the verification is expired
    const expiresAt = new Date(verificationData.expires_at);
    if (expiresAt < new Date()) {
      return {
        success: false,
        error: "Verification link has expired"
      };
    }

    // Handle different response types
    if (responseType === 'alive' || responseType === 'deceased') {
      // Status check response
      await supabase
        .from('contact_verifications')
        .update({
          responded_at: new Date().toISOString(),
          response: responseType
        })
        .eq('verification_token', token);
      
      // Log the status check response
      await supabase.from('death_verification_logs').insert({
        user_id: verificationData.user_id,
        action: 'status_check_response',
        details: {
          verification_id: verificationData.id,
          contact_id: verificationData.contact_id,
          contact_type: verificationData.contact_type,
          response: responseType
        }
      });
      
      return {
        success: true,
        message: responseType === 'alive'
          ? "Thank you for confirming that the person is still alive."
          : "Thank you for reporting this information. Our system has recorded your response."
      };
    } else {
      // Trusted contact invitation response
      await supabase
        .from('contact_verifications')
        .update({
          responded_at: new Date().toISOString(),
          response: responseType
        })
        .eq('verification_token', token);
      
      // Update the trusted contact based on the response
      const status = responseType === 'accept' ? 'verified' : 'declined';
      await supabase
        .from('trusted_contacts')
        .update({
          invitation_status: status,
          invitation_responded_at: new Date().toISOString()
        })
        .eq('id', verificationData.contact_id);
      
      // Log the verification response
      await supabase.from('death_verification_logs').insert({
        user_id: verificationData.user_id,
        action: responseType === 'accept' ? 'trusted_contact_accepted' : 'trusted_contact_declined',
        details: {
          contact_id: verificationData.contact_id,
          verification_id: verificationData.id,
        }
      });
      
      return {
        success: true,
        message: responseType === 'accept'
          ? "Thank you for accepting the invitation as a trusted contact."
          : "You have declined the invitation as a trusted contact."
      };
    }
  } catch (error) {
    console.error("Error processing verification response:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error processing verification"
    };
  }
};
