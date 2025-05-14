
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { 
  getResendClient, 
  buildDefaultEmailLayout, 
  isEmailSendSuccess, 
  formatResendError 
} from "../_shared/email-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ContactInvitation {
  contactId: string;
  contactType: 'beneficiary' | 'executor' | 'trusted';
  name: string;
  email: string;
  userId: string;
  userFullName?: string;
}

interface EmailDetails {
  subject?: string;
  includeVerificationInstructions?: boolean;
  includeUserBio?: boolean;
  priority?: 'normal' | 'high';
  customMessage?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the contact and email information
    const { contact, emailDetails } = await req.json() as { 
      contact: ContactInvitation;
      emailDetails?: EmailDetails;
    };
    
    if (!contact || !contact.email || !contact.contactType || !contact.contactId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required contact information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Processing invitation for contact:", contact.name, contact.email);
    
    // Get user info if fullName isn't provided
    let userFullName = contact.userFullName;
    let userBio = "";
    
    if (!userFullName || (emailDetails?.includeUserBio)) {
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, full_name, bio')
        .eq('id', contact.userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        userFullName = userData.full_name || 
          (userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}` 
            : 'A WillTank user');
            
        if (userData.bio && emailDetails?.includeUserBio) {
          userBio = userData.bio;
        }
      }
    }
    
    // Generate a notification token (for tracking only, no verification needed)
    const notificationToken = crypto.randomUUID();
    
    // Store the notification record in the database
    const { error: tokenError } = await supabase
      .from('contact_notifications')
      .insert({
        user_id: contact.userId,
        contact_id: contact.contactId,
        contact_type: contact.contactType,
        notification_token: notificationToken,
        notification_type: 'invitation'
      });
      
    if (tokenError) {
      console.error('Error storing notification token:', tokenError);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to create notification record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Add user bio if requested
    const bioSection = userBio ? 
      `<div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4a6cf7;">
        <p style="font-style: italic;">"${userBio}"</p>
       </div>` : '';
    
    // Add custom message if provided
    const customMessageSection = emailDetails?.customMessage ? 
      `<div style="margin: 20px 0;">
        <p>${emailDetails.customMessage}</p>
       </div>` : '';
    
    // Get executors list for trusted contacts
    let executorInfo = '';
    if (contact.contactType === 'trusted') {
      const { data: executors } = await supabase
        .from('will_executors')
        .select('name, email')
        .eq('user_id', contact.userId)
        .limit(1);
        
      if (executors && executors.length > 0) {
        const executor = executors[0];
        executorInfo = `
          <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #334155;">Executor Contact Information:</h3>
            <p style="margin-bottom: 8px;">In case of emergency, please contact the executor:</p>
            <p style="margin-bottom: 5px;"><strong>Name:</strong> ${executor.name}</p>
            <p style="margin-bottom: 5px;"><strong>Email:</strong> ${executor.email}</p>
          </div>
        `;
      }
    }
    
    // Generate subject based on contact type and email details
    let subject = emailDetails?.subject || '';
    let content = '';
    let roleDescription = '';
    
    switch (contact.contactType) {
      case 'beneficiary':
        subject = subject || `You've been named as a beneficiary by ${userFullName}`;
        roleDescription = 'beneficiary in their will';
        break;
      case 'executor':
        subject = subject || `You've been named as an executor by ${userFullName}`;
        roleDescription = 'executor of their will';
        break;
      case 'trusted':
        subject = subject || `You've been named as a trusted contact by ${userFullName}`;
        roleDescription = 'trusted contact for their death verification system';
        break;
    }
    
    // Create content for each contact type - INFORMATION ONLY, NO BUTTONS OR ACTION LINKS
    if (contact.contactType === 'trusted') {
      content = `
        <h1>You've been named as a Trusted Contact</h1>
        <p>Hello ${contact.name},</p>
        <p>${userFullName} has added you as a <strong>trusted contact</strong> in their WillTank account.</p>
        
        ${bioSection}
        ${customMessageSection}
        
        <h2>What does this mean?</h2>
        <p>As a trusted contact, you'll receive notifications when ${userFullName} misses their scheduled check-ins in the WillTank system. These notifications are for your information only.</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #0369a1;">INFORMATION ONLY - NO ACTION REQUIRED</h3>
          <p>This is an information-only notification. You do not need to click any links, verify any information, or take any action.</p>
          <p>All future communications will also be for information purposes only.</p>
        </div>
        
        <p>In case of multiple missed check-ins, you'll receive more detailed information and contact details for the executor.</p>
        
        ${executorInfo}
        
        <p>You don't need to create an account or verify anything. This is an information-only email.</p>
        <p>If you have any questions, please contact ${userFullName} directly.</p>
      `;
    } else if (contact.contactType === 'executor') {
      content = `
        <h1>You've been named as an Executor</h1>
        <p>Hello ${contact.name},</p>
        <p>${userFullName} has named you as an <strong>executor</strong> for their will on WillTank.</p>
        
        ${bioSection}
        ${customMessageSection}
        
        <h2>Your Role as an Executor</h2>
        <p>As an executor, you'll have important responsibilities regarding ${userFullName}'s estate in the event of their passing. ${userFullName} will be in touch with you directly to discuss these responsibilities in detail.</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #0369a1;">INFORMATION ONLY - NO ACTION REQUIRED</h3>
          <p>This is an information-only notification. You do not need to click any links, verify any information, or take any action at this time.</p>
        </div>
        
        <h3>The PIN System</h3>
        <p>In the event of ${userFullName}'s passing, you'll receive a special email with instructions to access their documents through a secure portal. The system uses a multi-factor PIN verification for maximum security.</p>
        
        <p>You don't need to create an account or verify anything at this time. This is an information-only email.</p>
        <p>If you have any questions, please contact ${userFullName} directly.</p>
      `;
    } else {
      // Beneficiary content
      content = `
        <h1>You've been named as a Beneficiary</h1>
        <p>Hello ${contact.name},</p>
        <p>${userFullName} has named you as a <strong>beneficiary</strong> in their will on WillTank.</p>
        
        ${bioSection}
        ${customMessageSection}
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #0369a1;">INFORMATION ONLY - NO ACTION REQUIRED</h3>
          <p>This is an information-only notification. No action is required from you at this time.</p>
        </div>
        
        <p>This is simply a notification to let you know about your inclusion in ${userFullName}'s estate planning.</p>
        
        <p>You don't need to create an account or verify anything. This is an information-only email.</p>
        <p>If you have any questions, please contact ${userFullName} directly.</p>
      `;
    }
    
    // Initialize Resend client and send the email
    const resend = getResendClient();
    
    const emailResponse = await resend.emails.send({
      from: "WillTank <notifications@willtank.com>",
      to: [contact.email],
      subject: subject,
      html: buildDefaultEmailLayout(content),
      tags: [
        {
          name: 'contactType',
          value: contact.contactType
        },
        {
          name: 'category',
          value: 'invitation'
        }
      ]
    });
    
    if (!isEmailSendSuccess(emailResponse)) {
      const errorMessage = formatResendError(emailResponse);
      console.error('Error sending invitation email:', errorMessage);
      return new Response(
        JSON.stringify({ success: false, message: `Failed to send email: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Invitation email sent successfully:', emailResponse.id);
    
    // Update the contact record to mark invitation as sent
    if (contact.contactType === 'trusted') {
      await supabase
        .from('trusted_contacts')
        .update({
          invitation_sent_at: new Date().toISOString(),
          invitation_status: 'sent'
        })
        .eq('id', contact.contactId);
    }
    
    // Log the invitation
    await supabase.from('death_verification_logs').insert({
      user_id: contact.userId,
      action: `${contact.contactType}_invitation_sent`,
      details: {
        contact_id: contact.contactId,
        contact_name: contact.name,
        contact_email: contact.email,
        email_id: emailResponse.id,
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation email sent successfully to ${contact.name}`,
        emailId: emailResponse.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error processing contact invitation:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: `Error processing invitation: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
