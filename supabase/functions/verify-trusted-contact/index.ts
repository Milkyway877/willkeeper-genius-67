
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getResendClient, buildDefaultEmailLayout, isEmailSendSuccess, formatResendError } from "../_shared/email-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contactId } = await req.json();

    if (!contactId) {
      return new Response(
        JSON.stringify({ error: "Missing contact ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get contact information
    const { data: contact, error: contactError } = await supabase
      .from('trusted_contacts')
      .select('*, user_profiles!trusted_contacts_user_id_fkey(full_name)')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      return new Response(
        JSON.stringify({ error: "Contact not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create verification token
    const verificationToken = crypto.randomUUID();
    
    // Set expiration date to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create contact verification record
    const { error: verificationError } = await supabase
      .from('contact_verifications')
      .insert({
        contact_id: contactId,
        contact_type: 'trusted',
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString(),
        user_id: contact.user_id
      });
    
    if (verificationError) {
      return new Response(
        JSON.stringify({ error: "Failed to create verification record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update contact record to show verification was sent
    const { error: updateError } = await supabase
      .from('trusted_contacts')
      .update({ verification_sent: true })
      .eq('id', contactId);
    
    if (updateError) {
      console.error('Error updating contact record:', updateError);
    }

    // Create verification URL
    const verificationUrl = `https://willtank.com/verify/contact/${verificationToken}`;
    
    // Get resend client
    const resend = getResendClient();
    
    // Prepare email content
    const userName = contact.user_profiles?.full_name || 'A WillTank user';
    const emailContent = `
      <h1>Trusted Contact Verification</h1>
      <p>Hello ${contact.name},</p>
      <p>${userName} has added you as a trusted contact for their will on WillTank. As a trusted contact, you will be asked to verify their status if they miss scheduled check-ins.</p>
      <p>You have been specifically selected as a trusted contact because you are considered reliable and impartial. Unlike beneficiaries or executors, you have no financial interest in the will contents.</p>
      <p>Please click the button below to verify your contact information:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">VERIFY MY CONTACT</a>
      </div>
      <p>If you did not expect this request or have questions, please contact ${userName} directly.</p>
      <p>Thank you for helping to ensure the security and integrity of ${userName}'s digital legacy.</p>
    `;
    
    // Send verification email
    const emailResponse = await resend.emails.send({
      from: "WillTank Verification <verification@willtank.com>",
      to: [contact.email],
      subject: `Trusted Contact Verification for ${userName}`,
      html: buildDefaultEmailLayout(emailContent),
    });
    
    if (!isEmailSendSuccess(emailResponse)) {
      const errorMessage = formatResendError(emailResponse);
      return new Response(
        JSON.stringify({ error: `Failed to send verification email: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the verification email sent
    await supabase.from('death_verification_logs').insert({
      user_id: contact.user_id,
      action: 'verification_email_sent',
      details: {
        contact_id: contactId,
        contact_name: contact.name,
        contact_email: contact.email,
        email_id: emailResponse.id,
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification email sent successfully",
        emailId: emailResponse.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
