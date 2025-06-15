import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getResendClient, buildDefaultEmailLayout } from "../_shared/email-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  
  const resend = getResendClient();
  
  // Build role-specific content
  let roleDescription = '';
  let responsibilities = '';
  let nextSteps = '';
  
  switch (contact.contactType) {
    case 'executor':
      roleDescription = `You have been designated as ${contact.additionalInfo?.isPrimary ? 'the primary executor' : 'an executor'} of ${contact.userFullName}'s will on WillTank.`;
      responsibilities = `
        <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
          <li>You will be responsible for carrying out ${contact.userFullName}'s final wishes as outlined in their will</li>
          <li>You will receive notifications if ${contact.userFullName} misses their regular check-ins</li>
          <li>You may be asked to help verify ${contact.userFullName}'s status in case of missed check-ins</li>
          <li>Upon verified death, you will receive access to unlock and execute the will</li>
          ${contact.additionalInfo?.isPrimary ? '<li><strong>As the primary executor, you have additional override capabilities</strong></li>' : ''}
        </ul>
      `;
      break;
      
    case 'beneficiary':
      roleDescription = `You have been designated as a beneficiary in ${contact.userFullName}'s will on WillTank.`;
      responsibilities = `
        <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
          <li>You are entitled to receive assets or bequests as specified in ${contact.userFullName}'s will</li>
          <li>You will receive notifications if ${contact.userFullName} misses their regular check-ins</li>
          <li>You may be asked to help verify ${contact.userFullName}'s status in case of missed check-ins</li>
          <li>Upon verified death, you will be contacted about your inheritance</li>
        </ul>
      `;
      break;
      
    case 'trusted_contact':
      roleDescription = `You have been designated as a trusted contact for ${contact.userFullName} on WillTank.`;
      responsibilities = `
        <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
          <li>You will receive notifications if ${contact.userFullName} misses their regular check-ins</li>
          <li>You may be asked to help verify ${contact.userFullName}'s status and well-being</li>
          <li>Your role is to help ensure ${contact.userFullName}'s digital legacy is properly managed</li>
          <li>You serve as an additional safety net in the verification process</li>
        </ul>
      `;
      break;
  }
  
  nextSteps = `
    <h3 style="color: #1f2937;">What happens next:</h3>
    <ol style="color: #374151; margin: 10px 0; padding-left: 20px;">
      <li>No action is required from you at this time</li>
      <li>You will receive email notifications if ${contact.userFullName} misses check-ins</li>
      <li>If you receive a notification, try to contact ${contact.userFullName} to remind them to check in</li>
      <li>Keep this email for your records as it contains important contact information</li>
    </ol>
  `;
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a6cf7;">Important: You've Been Added to a WillTank Account</h1>
      <p>Dear ${contact.name},</p>
      <p>${roleDescription}</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Your Role & Responsibilities:</h3>
        ${responsibilities}
      </div>

      ${nextSteps}

      <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
        <p><strong>Account Holder:</strong> ${contact.userFullName}<br>
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
      <p>Thank you for being part of ${contact.userFullName}'s digital legacy protection plan.</p>
      <p>Best regards,<br>The WillTank Team</p>
    </div>
  `;
  
  try {
    const emailResponse = await resend.emails.send({
      from: "WillTank <notifications@willtank.com>",
      to: [contact.email],
      subject: `Important: You've been added as ${contact.contactType.replace('_', ' ')} for ${contact.userFullName}`,
      html: buildDefaultEmailLayout(emailContent),
      tags: [
        { name: 'type', value: 'welcome_notification' },
        { name: 'role', value: contact.contactType }
      ]
    });

    // Log the notification
    await supabase.from('death_verification_logs').insert({
      user_id: contact.userId,
      action: 'welcome_notification_sent',
      details: {
        contact_id: contact.contactId,
        contact_type: contact.contactType,
        contact_name: contact.name,
        contact_email: contact.email,
        email_id: emailResponse.id,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome notification sent successfully",
        emailId: emailResponse.id
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
