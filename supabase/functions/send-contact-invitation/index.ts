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
  isInformationalOnly?: boolean;
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
    
    if (!userFullName) {
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
            
        if (userData.bio) {
          userBio = userData.bio;
        }
      }
    }
    
    // For trusted contacts, always update to delivered status
    if (contact.contactType === 'trusted') {
      await supabase
        .from('trusted_contacts')
        .update({
          invitation_status: 'delivered',
          invitation_sent_at: new Date().toISOString(),
          invitation_responded_at: new Date().toISOString()  // Mark as responded immediately
        })
        .eq('id', contact.contactId);
    }
    
    // Generate email content based on contact type
    let subject = emailDetails?.subject || '';
    
    switch (contact.contactType) {
      case 'beneficiary':
        subject = subject || `You've been named as a beneficiary by ${userFullName}`;
        break;
      case 'executor':
        subject = subject || `You've been named as an executor by ${userFullName}`;
        break;
      case 'trusted':
        subject = subject || `You've been named as a trusted contact by ${userFullName}`;
        break;
    }
    
    // Add user bio if available
    const bioSection = userBio ? 
      `<div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4a6cf7;">
        <p style="font-style: italic;">"${userBio}"</p>
       </div>` : '';
    
    // Add custom message if provided
    const customMessageSection = emailDetails?.customMessage ? 
      `<div style="margin: 20px 0;">
        <p>${emailDetails.customMessage}</p>
       </div>` : '';
    
    // Generate content for trusted contacts - always informational
    let content = '';
    
    if (contact.contactType === 'trusted') {
      content = `
        <h1>Important Information</h1>
        <p>Hello ${contact.name},</p>
        <p>${userFullName} has named you as a trusted contact for their death verification system in their WillTank account.</p>
        
        ${bioSection}
        ${customMessageSection}
        
        <h2>What does being a trusted contact mean?</h2>
        <p>As a trusted contact, your role is crucial. If ${userFullName} fails to respond to regular check-ins in our system, you may be contacted to confirm their status. This is an important safeguard that helps verify if they're still able to manage their digital legacy.</p>
        <p>Your responsibilities include:</p>
        <ul>
          <li>Responding to verification requests if ${userFullName} misses check-ins</li>
          <li>Providing accurate information about ${userFullName}'s status when contacted</li>
          <li>Maintaining confidentiality about your role and any information you receive</li>
        </ul>
        
        <p>No action is required from you at this time. This email is for informational purposes only.</p>
        
        <p>If you have any questions about this role, please contact ${userFullName} directly.</p>
        
        <p>Thank you for being a trusted part of ${userFullName}'s digital legacy plan.</p>
      `;
    } else {
      // For other contact types (keeping some basic structure)
      content = `
        <h1>Important Information</h1>
        <p>Hello ${contact.name},</p>
        <p>${userFullName} has named you as a ${contact.contactType} in their WillTank account.</p>
        
        ${bioSection}
        ${customMessageSection}
        
        <p>This is an informational email to let you know about your role.</p>
        
        <p>If you have any questions, please contact ${userFullName} directly.</p>
        
        <p>Thank you for being part of ${userFullName}'s digital legacy plan.</p>
      `;
    }
    
    // Get resend client to send the email
    const resend = getResendClient();
    
    // Set email priority headers
    const emailPriority = emailDetails?.priority === 'high' ? { 
      headers: { 
        "X-Priority": "1",
        "Importance": "high" 
      } 
    } : {};
    
    // Send the email
    console.log("Sending email to:", contact.email);
    const emailResponse = await resend.emails.send({
      from: "WillTank <invitations@willtank.com>",
      to: [contact.email],
      subject: subject,
      html: buildDefaultEmailLayout(content),
      ...emailPriority,
      tags: [
        {
          name: 'contact_type',
          value: contact.contactType
        },
        {
          name: 'email_type',
          value: 'informational'
        }
      ]
    });
    
    if (!isEmailSendSuccess(emailResponse)) {
      const errorMessage = formatResendError(emailResponse);
      console.error('Error sending email:', errorMessage);
      
      // Create a system notification about the failed email
      await supabase.rpc(
        'create_notification',
        {
          p_user_id: contact.userId,
          p_title: 'Email Delivery Failed',
          p_description: `We couldn't send the email to ${contact.name}. Please try again later.`,
          p_type: 'warning'
        }
      );
      
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send email", error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Email sent successfully:', emailResponse.id);
    
    // Store the event in logs
    await supabase.from('death_verification_logs').insert({
      user_id: contact.userId,
      action: 'information_sent',
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
        p_title: 'Email Sent',
        p_description: `An email has been sent to ${contact.name} for the role of ${contact.contactType}.`,
        p_type: 'success'
      }
    );
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        emailId: emailResponse.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Failed to process request",
        error: error.message || "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
