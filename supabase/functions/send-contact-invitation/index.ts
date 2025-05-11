import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { 
  getResendClient, 
  buildDefaultEmailLayout, 
  isEmailSendSuccess, 
  formatResendError 
} from "../_shared/email-helper.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
  customContent?: {
    html: string;
    text: string;
  };
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
    
    // If we're using the new flow without verification, we don't need to create a verification token
    let htmlContent = '';
    let textContent = '';
    
    // If custom content is provided, use it directly
    if (emailDetails?.customContent) {
      htmlContent = emailDetails.customContent.html;
      textContent = emailDetails.customContent.text;
    }
    // Otherwise build content based on contact type and email details
    else {
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
      
      // Detailed role descriptions
      let roleDescription = '';
      let roleDetailedDescription = '';
      
      switch (contact.contactType) {
        case 'trusted':
          roleDescription = 'trusted contact';
          roleDetailedDescription = `
            <h2>What does being a trusted contact mean?</h2>
            <p>As a trusted contact, your role is important. If ${userFullName} fails to respond to regular check-ins in our system, you will receive an email notification. If you confirm that ${userFullName} has passed away, you should contact their executor.</p>
            <p>Your responsibilities include:</p>
            <ul>
              <li>Being aware that you're a trusted contact for ${userFullName}</li>
              <li>Attempting to contact ${userFullName} directly if notified of missed check-ins</li>
              <li>Contacting the executor if you confirm ${userFullName}'s passing</li>
              <li>Providing a PIN code to the executor if requested</li>
            </ul>
            <p>No action is required from you at this time. This email is simply to inform you of your role.</p>
          `;
          break;
        case 'beneficiary':
          roleDescription = 'beneficiary in their will';
          roleDetailedDescription = `
            <h2>What does being a beneficiary mean?</h2>
            <p>As a beneficiary, ${userFullName} has named you to receive certain assets or possessions in their will. You don't need to take any action at this time.</p>
            <p>If ${userFullName} passes away, their executor will contact you with more information about your inheritance.</p>
          `;
          break;
        case 'executor':
          roleDescription = 'executor of their will';
          roleDetailedDescription = `
            <h2>What does being an executor mean?</h2>
            <p>As an executor, you have an important responsibility. If ${userFullName} passes away, you'll be responsible for carrying out their wishes as specified in their will.</p>
            <p>In the event of ${userFullName}'s passing, you'll need to:</p>
            <ul>
              <li>Visit the WillTank executor portal</li>
              <li>Collect PIN codes from trusted contacts to verify your identity</li>
              <li>Access and download the will documents</li>
              <li>Follow the instructions in the will to distribute assets</li>
            </ul>
          `;
          break;
      }
      
      // Build the complete email content
      htmlContent = `
        <h1>Important Role Information</h1>
        <p>Hello ${contact.name},</p>
        <p>${userFullName} has named you as a ${roleDescription} in their WillTank account.</p>
        
        ${bioSection}
        ${customMessageSection}
        
        ${roleDetailedDescription}
        
        <p>Thank you for being a trusted part of ${userFullName}'s digital legacy plan.</p>
      `;
      
      // Simple text version
      textContent = `
Hello ${contact.name},

${userFullName} has named you as a ${roleDescription} in their WillTank account.

${userBio ? `"${userBio}"` : ''}
${emailDetails?.customMessage || ''}

No action is required from you at this time. This email is simply to inform you of your role.

Thank you for being a trusted part of ${userFullName}'s digital legacy plan.
      `.trim();
    }
    
    // Update contact status in database
    await supabase
      .from('trusted_contacts')
      .update({
        invitation_sent_at: new Date().toISOString(),
        invitation_status: 'delivered'
      })
      .eq('id', contact.contactId);
    
    // Get resend client to send the email
    const resend = getResendClient();
    
    // Set email priority headers
    const emailPriority = emailDetails?.priority === 'high' ? { 
      headers: { 
        "X-Priority": "1",
        "Importance": "high" 
      } 
    } : {};
    
    // Prepare the email subject
    const subject = emailDetails?.subject || `Important: ${userFullName} has named you as a ${contact.contactType}`;
    
    // Send the email
    console.log("Sending information email to:", contact.email);
    const emailResponse = await resend.emails.send({
      from: "WillTank <notifications@willtank.com>",
      to: [contact.email],
      subject: subject,
      html: buildDefaultEmailLayout(htmlContent),
      text: textContent,
      ...emailPriority,
      tags: [
        {
          name: 'contact_type',
          value: contact.contactType
        },
        {
          name: 'notification',
          value: 'true'
        }
      ]
    });
    
    if (!isEmailSendSuccess(emailResponse)) {
      const errorMessage = formatResendError(emailResponse);
      console.error('Error sending information email:', errorMessage);
      
      // Create a system notification about the failed email
      await supabase.rpc(
        'create_notification',
        {
          p_user_id: contact.userId,
          p_title: 'Email Delivery Failed',
          p_description: `We couldn't send the information email to ${contact.name}. Please try again later.`,
          p_type: 'warning'
        }
      );
      
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send information email", error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Information email sent successfully:', emailResponse.id);
    
    // Store the email event in logs
    await supabase.from('death_verification_logs').insert({
      user_id: contact.userId,
      action: 'contact_email_sent',
      details: {
        contact_id: contact.contactId,
        contact_type: contact.contactType,
        contact_name: contact.name,
        contact_email: contact.email,
        email_id: emailResponse.id,
      }
    });
    
    // Create a notification for the user about successful email
    await supabase.rpc(
      'create_notification',
      {
        p_user_id: contact.userId,
        p_title: 'Information Email Sent',
        p_description: `An information email has been sent to ${contact.name}.`,
        p_type: 'success'
      }
    );
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Information email sent successfully",
        emailId: emailResponse.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending information email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Failed to process email",
        error: error.message || "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
