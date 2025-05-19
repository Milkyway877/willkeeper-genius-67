
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getResendClient, buildDefaultEmailLayout } from "../_shared/email-helper.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request data
    const { contact, emailDetails } = await req.json();
    
    if (!contact || !contact.contactId || !contact.email) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing contact information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    
    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Create verification record
    const { error: verificationError } = await supabase
      .from('contact_verifications')
      .insert({
        contact_id: contact.contactId,
        contact_type: contact.contactType,
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString(),
        user_id: contact.userId
      });
    
    if (verificationError) {
      console.error('Error creating verification record:', verificationError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create verification record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get Resend client
    const resend = getResendClient();
    
    // Prepare email content - Updated to be more informational
    let emailHtml = `
      <h1>Important Information: You've Been Named as a Trusted Contact</h1>
      <p>Hello ${contact.name},</p>
      <p>${contact.userFullName} has designated you as a trusted contact in their WillTank account.</p>
      <h2>What Does This Mean?</h2>
      <p>As a trusted contact, you play an important role in the security of ${contact.userFullName}'s digital legacy:</p>
      <ul>
        <li>You may be contacted periodically to verify ${contact.userFullName}'s status</li>
        <li>If ${contact.userFullName} misses their regular check-ins, you'll be notified</li>
        <li>You may help verify their status if they become unreachable</li>
      </ul>
      <p>You don't need to take any action right now. This email is for informational purposes only.</p>
      <p>If you have any questions or concerns about this role, or if you're unable to serve as a trusted contact, please contact ${contact.userFullName} directly.</p>
    `;
    
    // Add any custom message if provided
    if (emailDetails.customMessage) {
      emailHtml += `
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #4a6cf7; background-color: #f9fafb;">
          <h3>Message from ${contact.userFullName}:</h3>
          <p style="font-style: italic;">"${emailDetails.customMessage}"</p>
        </div>
      `;
    }
    
    // Add WillTank information
    emailHtml += `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
        <h3>About WillTank</h3>
        <p>WillTank is a secure digital time capsule service that helps people manage their digital legacy and ensure their wishes are carried out.</p>
        <p>For more information, visit <a href="https://willtank.com">willtank.com</a></p>
      </div>
    `;
    
    // Send email
    const emailResponse = await resend.emails.send({
      from: "WillTank <notifications@willtank.com>",
      to: [contact.email],
      subject: emailDetails.subject || `${contact.userFullName} has named you as a trusted contact`,
      html: buildDefaultEmailLayout(emailHtml),
      tags: [
        {
          name: "category",
          value: "trusted_contact"
        },
        {
          name: "contact_type",
          value: contact.contactType
        }
      ]
    });
    
    // Update the contact with the invitation sent timestamp
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase
      .from('trusted_contacts')
      .update({
        invitation_sent_at: new Date().toISOString(),
        invitation_status: 'sent'
      })
      .eq('id', contact.contactId);
    
    // Log the invitation
    await supabase.from('death_verification_logs').insert({
      user_id: contact.userId,
      action: 'trusted_contact_invitation_sent',
      details: {
        contact_id: contact.contactId,
        contact_name: contact.name,
        contact_email: contact.email,
        email_id: emailResponse.id
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
    console.error("Error sending invitation:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
