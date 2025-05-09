
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

    // First, check if we already have a recent valid code for this email
    const supabase = getSupabaseClient();
    const { data: existingCodes, error: queryError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('type', type)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (queryError) {
      console.error("Error checking for existing codes:", queryError);
      // Continue with sending the new code
    }
    
    // If a valid code exists and was created less than 2 minutes ago, don't send a new one
    // This prevents spam and abuse
    if (existingCodes && existingCodes.length > 0) {
      const mostRecentCode = existingCodes[0];
      const codeCreatedAt = new Date(mostRecentCode.created_at);
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      
      if (codeCreatedAt > twoMinutesAgo) {
        console.log("Rate limiting: Existing valid code was sent recently");
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
    }

    // Store verification code with explicit expiration time (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    // Store the verification code in the database BEFORE sending the email
    const { error: insertError } = await supabase
      .from('email_verification_codes')
      .insert({
        email: email,
        code: code,
        type: type,
        expires_at: expiresAt.toISOString(),
        used: false
      });
    
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

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
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
