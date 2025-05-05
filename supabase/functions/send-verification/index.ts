
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    const { email, code, type } = await req.json();
    
    if (!email || !code || !type) {
      throw new Error("Missing required fields: email, code, and type are required");
    }

    // Make sure code is a proper 6-digit string
    const formattedCode = code.toString().padStart(6, "0").substring(0, 6);
    
    console.log(`Sending ${type} verification email to ${email} with code ${formattedCode}`);

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

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Email Verification - WillTank</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
            Please use the following verification code to ${actionText}:
          </p>
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1a1a1a;">
              ${formattedCode}
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
