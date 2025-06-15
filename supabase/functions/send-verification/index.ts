import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Updated CORS headers to include all necessary methods
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper: generate a random 6-digit code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, code, type } = await req.json();

    if (!email || !code || !type) {
      throw new Error("Missing required fields: email, code, and type are required");
    }

    // Generate expiry for OTP (30 minutes from now)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

    // Setup Supabase admin client for DB insertion
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Insert the OTP into the password_reset_tokens table if for password-reset
    if (type === "password-reset") {
      const { error: insertError } = await supabase
        .from("password_reset_tokens")
        .insert([{
          email: email.toLowerCase().trim(),
          otp_code: code,
          expires_at: expiresAt,
          used: false,
          // explicitly add created_at for easier debugging if needed
          created_at: new Date().toISOString(),
        }]);
      if (insertError) {
        console.error("Failed to store OTP code:", insertError);
        throw new Error("Could not store code");
      }
    }

    // Compose subject and email content
    let subject = "Verify your email";
    let actionText = "verify your email";

    if (type === 'signup') {
      subject = "Verify your WillTank account";
      actionText = "complete your account setup";
    } else if (type === 'login') {
      subject = "Login verification code";
      actionText = "complete your sign-in";
    } else if (type === 'password-reset') {
      subject = "Your WillTank Password Reset Code";
      actionText = "reset your password";
    }

    // Email sender config
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const fromEmail = "support@willtank.com";
    const fromName = "WillTank";

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

    console.log("Email and OTP stored successfully:", emailResponse);

    return new Response(JSON.stringify({ message: "Verification sent successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending verification email or storing OTP:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
