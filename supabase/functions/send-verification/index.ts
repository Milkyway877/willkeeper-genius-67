
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders, handleCorsOptions } from "../_shared/cors.ts";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const APP_URL = Deno.env.get("APP_URL") || "https://willtank.com";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    const { email, type } = await req.json();
    
    if (!email || !type) {
      throw new Error("Missing required fields: email and type are required");
    }

    // Generate a secure verification token (UUID)
    const verificationToken = uuidv4();
    
    console.log(`Sending ${type} verification email to ${email} with token ${verificationToken}`);

    let subject = "Verify your email";
    let actionText = "verify your email";
    let buttonText = "Verify Email";
    
    if (type === 'signup') {
      subject = "Verify your WillTank account";
      actionText = "complete your account setup";
      buttonText = "Activate Account";
    } else if (type === 'login') {
      subject = "Login to WillTank";
      actionText = "sign in to your account";
      buttonText = "Sign In Now";
    }

    // Create verification link
    const verificationLink = `${APP_URL}/auth/verify?token=${verificationToken}&email=${encodeURIComponent(email)}&type=${type}`;

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
            Please click the button below to ${actionText}:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              ${buttonText}
            </a>
          </div>
          <p style="color: #4a4a4a; font-size: 16px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="background-color: #f4f4f4; padding: 12px; border-radius: 4px; word-break: break-all;">
            <a href="${verificationLink}" style="color: #1a1a1a; text-decoration: none; font-size: 14px;">
              ${verificationLink}
            </a>
          </p>
          <p style="color: #4a4a4a; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this verification, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} WillTank. All rights reserved.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true, 
      message: "Verification email sent",
      token: verificationToken
    }), {
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
