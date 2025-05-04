
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the contact information
    const { contact } = await req.json() as { contact: ContactInvitation };
    
    if (!contact || !contact.email || !contact.contactType || !contact.contactId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required contact information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Processing invitation for contact:", contact.name, contact.email);
    
    // Get user info if fullName isn't provided
    let userFullName = contact.userFullName;
    if (!userFullName) {
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, full_name')
        .eq('id', contact.userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        userFullName = userData.full_name || 
          (userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}` 
            : 'A WillTank user');
      }
    }
    
    // Generate a verification token
    const verificationToken = crypto.randomUUID();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // Token expires in 30 days
    
    // Store the verification token in the database
    const { error: tokenError } = await supabase
      .from('contact_verifications')
      .insert({
        user_id: contact.userId,
        contact_id: contact.contactId,
        contact_type: contact.contactType,
        verification_token: verificationToken,
        expires_at: expirationDate.toISOString()
      });
      
    if (tokenError) {
      console.error('Error storing verification token:', tokenError);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to create verification token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create verification URL
    const verificationUrl = `${req.headers.get("origin") || "https://willtank.com"}/verify/trusted-contact/${verificationToken}`;
    
    // Generate email content based on contact type
    let subject = '';
    let content = '';
    let roleDescription = '';
    
    switch (contact.contactType) {
      case 'beneficiary':
        subject = `You've been named as a beneficiary by ${userFullName}`;
        roleDescription = 'beneficiary in their will';
        break;
      case 'executor':
        subject = `You've been named as an executor by ${userFullName}`;
        roleDescription = 'executor of their will';
        break;
      case 'trusted':
        subject = `You've been named as a trusted contact by ${userFullName}`;
        roleDescription = 'trusted contact for their death verification system';
        break;
    }
    
    content = `
      <h1>Important Role Invitation</h1>
      <p>Hello ${contact.name},</p>
      <p>${userFullName} has named you as a ${roleDescription} in their WillTank account.</p>
      <p>As a ${contact.contactType}, you may be asked to participate in the death verification process if ${userFullName} stops responding to regular check-ins.</p>
      <p>Please click the button below to accept or decline this role:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">RESPOND TO INVITATION</a>
      </div>
      <p>If you have any questions about this role, please contact ${userFullName} directly.</p>
    `;
    
    // Get resend client to send the email
    const resend = getResendClient();
    
    // Send the email
    console.log("Sending invitation email to:", contact.email);
    const emailResponse = await resend.emails.send({
      from: "WillTank <invitations@willtank.com>",
      to: [contact.email],
      subject: subject,
      html: buildDefaultEmailLayout(content),
    });
    
    if (!isEmailSendSuccess(emailResponse)) {
      const errorMessage = formatResendError(emailResponse);
      console.error('Error sending invitation email:', errorMessage);
      
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send invitation email", error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Invitation email sent successfully:', emailResponse.id);
    
    // Store the verification event in logs
    await supabase.from('death_verification_logs').insert({
      user_id: contact.userId,
      action: 'invitation_sent',
      details: {
        contact_id: contact.contactId,
        contact_type: contact.contactType,
        contact_name: contact.name,
        contact_email: contact.email,
        verification_token: verificationToken,
        email_id: emailResponse.id,
      }
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation email sent successfully",
        emailId: emailResponse.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Failed to process invitation",
        error: error.message || "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
