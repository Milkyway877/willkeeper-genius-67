import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Inline Resend client function to avoid import issues
function getResendClient() {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  return {
    emails: {
      send: async (emailData: any) => {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Resend API error: ${error}`);
        }

        return await response.json();
      },
    },
  };
}

// Inline email layout function to avoid import issues
function buildDefaultEmailLayout(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WillTank Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #4a6cf7; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">WillTank</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Secure Digital Legacy Platform</p>
      </div>
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        ${content}
      </div>
      <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
        <p>© 2024 WillTank. All rights reserved.</p>
        <p>This is an automated message from WillTank's secure notification system.</p>
      </div>
    </body>
    </html>
  `;
}

interface AutoNotificationRequest {
  action: 'welcome_contact' | 'missed_checkin_alert' | 'status_check';
  contact: {
    contactId: string;
    contactType: 'executor' | 'beneficiary' | 'trusted_contact';
    name: string;
    email: string;
    userId: string;
    userFullName: string;
    userEmail: string;
    additionalInfo?: {
      relation?: string;
      phone?: string;
      isPrimary?: boolean;
    };
  };
  alertDetails?: {
    daysOverdue?: number;
    urgencyLevel?: 'mild' | 'moderate' | 'severe';
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));
    
    if (!requestData.contact.email || !requestData.contact.name) {
      throw new Error('Contact email and name are required');
    }

    // Only process welcome notifications here!
    if (requestData.action !== 'welcome_contact') {
      return new Response(
        JSON.stringify({ 
          error: "This function only handles role/welcome notifications.",
          allowed: ["welcome_contact"]
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return await sendWelcomeNotification(requestData.contact);

  } catch (error) {
    console.error("Error in auto-contact-notifier:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendWelcomeNotification(contact) {
  console.log(`Sending welcome notification to ${contact.contactType}: ${contact.name}`);
  console.log('Contact details:', JSON.stringify(contact, null, 2));
  
  const resend = getResendClient();
  
  // For trusted contacts, fetch the verification code word
  let verificationCodeWord = null;
  if (contact.contactType === 'trusted_contact' && contact.contactId) {
    try {
      const { data: trustedContact, error: trustedContactError } = await supabase
        .from('trusted_contacts')
        .select('verification_code_word')
        .eq('id', contact.contactId)
        .single();
      
      if (!trustedContactError && trustedContact) {
        verificationCodeWord = trustedContact.verification_code_word;
        console.log('Retrieved verification code word for trusted contact');
      } else {
        console.error('Error fetching verification code word:', trustedContactError);
      }
    } catch (err) {
      console.error('Exception fetching verification code word:', err);
    }
  }
  
  // Ensure we have the user's full name - with better fallback logic
  const userFullName = contact.userFullName || 'A WillTank user';
  console.log('Using user full name:', userFullName);
  
  // Build role-specific content
  let roleDescription = '';
  let responsibilities = '';
  let nextSteps = '';
  
  switch (contact.contactType) {
    case 'executor':
      roleDescription = `You have been designated as ${contact.additionalInfo?.isPrimary ? 'the primary executor' : 'an executor'} of ${userFullName}'s will on WillTank.`;
      responsibilities = `
        <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
          <li>You will be responsible for carrying out ${userFullName}'s final wishes as outlined in their will</li>
          <li>You will receive notifications if ${userFullName} misses their regular check-ins</li>
          <li>You may be asked to help verify ${userFullName}'s status in case of missed check-ins</li>
          <li>Upon verified death, you will receive access to unlock and execute the will</li>
          ${contact.additionalInfo?.isPrimary ? '<li><strong>As the primary executor, you have additional override capabilities</strong></li>' : ''}
        </ul>
      `;
      break;
      
    case 'beneficiary':
      roleDescription = `You have been designated as a beneficiary in ${userFullName}'s will on WillTank.`;
      responsibilities = `
        <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
          <li>You are entitled to receive assets or bequests as specified in ${userFullName}'s will</li>
          <li>You will receive notifications if ${userFullName} misses their regular check-ins</li>
          <li>You may be asked to help verify ${userFullName}'s status in case of missed check-ins</li>
          <li>Upon verified death, you will be contacted about your inheritance</li>
        </ul>
      `;
      break;
      
    case 'trusted_contact':
      roleDescription = `You have been designated as a trusted contact for ${userFullName} on WillTank.`;
      responsibilities = `
        <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
          <li>You will receive notifications if ${userFullName} misses their regular check-ins</li>
          <li>You may be asked to help verify ${userFullName}'s status and well-being</li>
          <li>Your role is to help ensure ${userFullName}'s digital legacy is properly managed</li>
          <li>You serve as an additional safety net in the verification process</li>
          ${verificationCodeWord ? '<li><strong>You have been assigned a special verification code word for security purposes</strong></li>' : ''}
        </ul>
      `;
      break;
  }
  
  nextSteps = `
    <h3 style="color: #1f2937;">What happens next:</h3>
    <ol style="color: #374151; margin: 10px 0; padding-left: 20px;">
      <li><strong>No action is required from you at this time</strong></li>
      <li>You will receive email notifications if ${userFullName} misses check-ins</li>
      <li>If you receive a notification, try to contact ${userFullName} to remind them to check in</li>
      <li>Keep this email for your records as it contains important contact information</li>
      ${verificationCodeWord ? '<li><strong>Keep your verification code word safe - you may need it for identity verification</strong></li>' : ''}
    </ol>
  `;

  // Add verification code word section for trusted contacts
  let codeWordSection = '';
  if (contact.contactType === 'trusted_contact' && verificationCodeWord) {
    codeWordSection = `
      <div style="background-color: #f0fdf4; border: 2px solid #22c55e; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
        <h2 style="color: #166534; font-size: 1.3em; margin-bottom: 12px; margin-top: 0;">🔐 Your Personal Verification Code Word</h2>
        <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); border: 3px dashed #16a34a; border-radius: 10px; padding: 20px; margin: 16px 0;">
          <div style="font-size: 2.5em; font-weight: bold; color: #15803d; letter-spacing: 3px; text-transform: uppercase; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
            ${verificationCodeWord}
          </div>
        </div>
        <p style="color: #166534; margin: 12px 0; font-size: 15px; line-height: 1.5;">
          <strong>This is your unique verification word assigned by ${userFullName}.</strong><br>
          Keep this word confidential and secure. You may be asked for this word to verify your identity<br>
          when helping to confirm ${userFullName}'s status during missed check-ins.
        </p>
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin-top: 16px;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            ⚠️ <strong>Important:</strong> Never share this code word with anyone except official WillTank verification processes.
          </p>
        </div>
      </div>
    `;
  }

  // Add declining role section - enhanced for all contact types
  const decliningSection = `
    <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #92400e; margin-top: 0;">Don't Want This Role?</h3>
      <p style="color: #92400e; margin-bottom: 12px;">
        If you do not wish to serve as ${contact.contactType.replace('_', ' ')} for ${userFullName}, please contact them directly to request removal:
      </p>
      <div style="background-color: #fff; border: 1px solid #f59e0b; padding: 12px; border-radius: 4px;">
        <p style="color: #92400e; margin: 0; font-weight: bold;">
          📧 ${contact.userEmail}
        </p>
      </div>
      <p style="color: #92400e; margin-top: 12px; margin-bottom: 0; font-size: 14px;">
        <strong>Important:</strong> ${userFullName} will need to manually remove you from their will or contact list. You are not required to accept this role, and declining will not affect your relationship with ${userFullName}.
      </p>
    </div>
  `;
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a6cf7;">You've Been Added to ${userFullName}'s Digital Legacy Plan</h1>
      <p>Dear ${contact.name},</p>
      <p>${roleDescription}</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Your Role & Responsibilities:</h3>
        ${responsibilities}
      </div>

      ${codeWordSection}

      ${nextSteps}

      ${decliningSection}

      <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
        <p><strong>Account Holder:</strong> ${userFullName}<br>
        <strong>Email:</strong> ${contact.userEmail}<br>
        ${contact.additionalInfo?.relation ? `<strong>Your Relation:</strong> ${contact.additionalInfo.relation}<br>` : ''}
        ${contact.additionalInfo?.phone ? `<strong>Your Phone on File:</strong> ${contact.additionalInfo.phone}<br>` : ''}
        <strong>Your Role:</strong> ${contact.contactType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h4 style="color: #92400e; margin-top: 0;">About WillTank</h4>
        <p style="color: #92400e; margin: 0;">WillTank is a secure digital platform for creating and managing wills. Our check-in system ensures that wills are only accessible upon verified absence, protecting your loved one's final wishes.</p>
      </div>

      <p>If you have any questions about your role or WillTank, please contact our support team at support@willtank.com.</p>
      <p>Thank you for being part of ${userFullName}'s digital legacy protection plan.</p>
      <p>Best regards,<br>The WillTank Team</p>
    </div>
  `;
  
  try {
    const emailResponse = await resend.emails.send({
      from: "WillTank <notifications@willtank.com>",
      to: [contact.email],
      subject: `Important: You've been added as ${contact.contactType.replace('_', ' ')} for ${userFullName}`,
      html: buildDefaultEmailLayout(emailContent),
      tags: [
        { name: 'type', value: 'welcome_notification' },
        { name: 'role', value: contact.contactType }
      ]
    });

    // Log the notification with verification code word info
    await supabase.from('death_verification_logs').insert({
      user_id: contact.userId,
      action: 'welcome_notification_sent',
      details: {
        contact_id: contact.contactId,
        contact_type: contact.contactType,
        contact_name: contact.name,
        contact_email: contact.email,
        user_full_name: userFullName,
        email_id: emailResponse.id,
        verification_code_word_included: !!verificationCodeWord,
        timestamp: new Date().toISOString()
      }
    });

    console.log('Email sent successfully:', emailResponse.id);
    console.log('User name used in email:', userFullName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome notification sent successfully",
        emailId: emailResponse.id,
        userFullName: userFullName,
        verificationCodeWordIncluded: !!verificationCodeWord
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error sending welcome notification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
