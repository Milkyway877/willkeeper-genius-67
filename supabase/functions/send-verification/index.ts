
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getSupabaseClient } from "../_shared/db-helper.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, code, type } = await req.json();
    
    if (!email || !code || !type) {
      console.error("Missing required fields", { email: !!email, code: !!code, type });
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, code, and type are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Sending ${type} verification email to ${email} with code ${code}`);

    // Use consistent email subjects and messaging
    let subject = "Your verification code";
    let actionText = "verify your email";
    let headerText = "Verify your email";
    
    if (type === 'signup') {
      subject = "Verify your WillTank account";
      actionText = "complete your account setup";
      headerText = "Welcome to WillTank";
    } else if (type === 'login') {
      subject = "Your login verification code";
      actionText = "sign in to your account";
      headerText = "Login verification";
    }

    // Use the verified sender domain and name
    const fromEmail = "support@willtank.com";
    const fromName = "WillTank";

    const supabase = getSupabaseClient();
    
    // First check for rate limiting - has this email requested too many codes recently?
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    const { data: recentCodes, error: countError } = await supabase
      .from('email_verification_codes')
      .select('created_at', { count: 'exact' })
      .eq('email', email)
      .eq('type', type)
      .gt('created_at', twoMinutesAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (countError) {
      console.error("Error checking for rate limiting:", countError);
    } else if (recentCodes && recentCodes.length > 0) {
      console.log(`Rate limiting: ${recentCodes.length} codes sent to ${email} in the last 2 minutes`);
      
      // Return a different status code for rate limiting
      return new Response(
        JSON.stringify({ 
          message: "Verification code already sent recently. Please check your email or try again in a few minutes.",
          rateLimited: true
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Set expiration time to 30 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    // Delete any old unused codes for this email and type to prevent confusion
    try {
      const { error: deleteError } = await supabase
        .from('email_verification_codes')
        .delete()
        .eq('email', email)
        .eq('type', type)
        .eq('used', false);
        
      if (deleteError) {
        console.error("Error cleaning up old verification codes:", deleteError);
      }
    } catch (err) {
      console.error("Exception during cleanup:", err);
      // Continue regardless of cleanup success
    }
    
    // Store the verification code in the database BEFORE sending the email
    console.log("Storing verification code in database");
    
    const { data: storedData, error: insertError } = await supabase
      .from('email_verification_codes')
      .insert({
        email: email,
        code: code,
        type: type,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select();
    
    if (insertError) {
      console.error("Error storing verification code:", insertError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to store verification code",
          details: insertError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Code stored successfully:", storedData);
    
    // Verify code was stored by querying it back
    const { data: checkData, error: checkError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .eq('used', false)
      .single();
      
    if (checkError || !checkData) {
      console.error("Verification failed - code not found after insert:", { error: checkError });
      // Continue anyway since it might still work
    } else {
      console.log("Code successfully verified in database:", checkData.id);
    }

    // Now send the email
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">${headerText}</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
            Please use the following verification code to ${actionText}:
          </p>
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1a1a1a;">
              ${code}
            </span>
          </div>
          <p style="color: #4a4a4a; font-size: 14px;">
            This code will expire in 30 minutes. If you didn't request this verification, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} WillTank. All rights reserved.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", { id: emailResponse?.id });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent successfully",
        emailId: emailResponse?.id
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending verification email:", error);
    
    // Provide better error details
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: "Failed to send verification email. Please try again later."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
