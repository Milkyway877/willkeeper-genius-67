
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getSupabaseClient } from "../_shared/db-helper.ts";
import { corsHeaders, handleCorsRequest } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Helper function to log verification events
async function logVerificationEvent(email: string, type: string, action: string, details: any = {}) {
  try {
    const supabase = getSupabaseClient();
    
    await supabase
      .from('verification_logs')
      .insert({
        email,
        type,
        action,
        details: JSON.stringify(details),
        created_at: new Date().toISOString()
      });
  } catch (error) {
    // Non-fatal error, just log it
    console.error("Failed to log verification event:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    const { email, code, type } = await req.json();
    
    if (!email || !code || !type) {
      throw new Error("Missing required fields: email, code, and type are required");
    }

    console.log(`Sending ${type} verification email to ${email} with code ${code}`);
    
    // Check if the RESEND_API_KEY is set
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set in environment variables");
    }

    let subject = "Verify your email";
    let actionText = "verify your email";
    
    if (type === 'signup') {
      subject = "Verify your WillTank account";
      actionText = "complete your account setup";
    } else if (type === 'login') {
      subject = "Login verification code";
      actionText = "complete your sign-in";
    }

    // Use the verified sender domain and name
    const fromEmail = "support@willtank.com";
    const fromName = "WillTank";

    // Double-check that the code is in the database
    const supabase = getSupabaseClient();
    const { data: codeInDb, error: dbError } = await supabase
      .from('email_verification_codes')
      .select('id')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .single();
      
    if (dbError || !codeInDb) {
      console.error("Verification code not found in database:", dbError);
      await logVerificationEvent(email, type, "code_db_error", { error: dbError, code });
    } else {
      console.log("Verification code confirmed in database:", codeInDb.id);
    }

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Welcome to WillTank</h2>
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

    console.log("Email sent successfully:", emailResponse);
    
    // Log the successful send
    await logVerificationEvent(email, type, "email_sent", { 
      emailId: emailResponse?.id,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      data: emailResponse,
      message: "Verification code sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    
    try {
      // Try to log the error
      const requestData = await req.json().catch(() => ({}));
      await logVerificationEvent(
        requestData.email || "unknown", 
        requestData.type || "unknown",
        "email_error",
        { error: error.message }
      );
    } catch (logError) {
      // Ignore logging errors
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: "Failed to send verification email"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
