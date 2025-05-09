
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getSupabaseClient } from "../_shared/db-helper.ts";
import { createHash } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Generate a secure token for email verification links
const generateSecureToken = (email: string, type: string): string => {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 15);
  const data = `${email}:${type}:${timestamp}:${randomString}`;
  
  // Create SHA-256 hash of the data
  const encoder = new TextEncoder();
  const hash = createHash("sha256");
  hash.update(encoder.encode(data));
  const hashBuffer = hash.digest();
  
  // Convert to base64url format (URL-safe)
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

serve(async (req) => {
  console.log("Received request:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Responding to OPTIONS request with CORS headers");
    return new Response("ok", { 
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain"
      } 
    });
  }

  try {
    const requestBody = await req.json();
    const { email, type, useLink = true } = requestBody;
    
    if (!email || !type) {
      console.error("Missing required fields", { email: !!email, type });
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and type are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Sending ${type} verification ${useLink ? 'link' : 'code'} to ${email}`);
    
    // Generate verification code or token based on the request
    const code = !useLink ? (requestBody.code || Math.floor(100000 + Math.random() * 900000).toString()) 
                        : Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate a secure token for link-based verification
    const token = useLink ? generateSecureToken(email, type) : null;

    // Use consistent email subjects and messaging
    let subject = useLink ? "Verify your email address" : "Your verification code";
    let actionText = "verify your email";
    let headerText = "Verify your email";
    
    if (type === 'signup') {
      subject = useLink ? "Complete your WillTank account setup" : "Verify your WillTank account";
      actionText = "complete your account setup";
      headerText = "Welcome to WillTank";
    } else if (type === 'login') {
      subject = useLink ? "Login verification for WillTank" : "Your login verification code";
      actionText = "sign in to your account";
      headerText = "Login verification";
    }

    // Use the verified sender domain and name
    const fromEmail = "support@willtank.com";
    const fromName = "WillTank";

    const supabase = getSupabaseClient();
    
    // First check for rate limiting - has this email requested too many verifications recently?
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    try {
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
        console.log(`Rate limiting: ${recentCodes.length} verifications sent to ${email} in the last 2 minutes`);
        
        // Return a different status code for rate limiting
        return new Response(
          JSON.stringify({ 
            message: "Verification already sent recently. Please check your email or try again in a few minutes.",
            rateLimited: true
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      // Log but continue if rate limiting check fails
      console.error("Error during rate limit check:", error);
    }

    // Set expiration time to 30 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    // Delete any old unused codes/tokens for this email and type to prevent confusion
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
    
    // Construct verification link for link-based verification
    let verificationLink = '';
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:3000';
    
    if (useLink) {
      if (type === 'signup') {
        verificationLink = `${baseUrl}/auth/verify?token=${token}&type=${type}`;
      } else if (type === 'login') {
        verificationLink = `${baseUrl}/auth/login-verify?token=${token}&email=${encodeURIComponent(email)}`;
      } else {
        verificationLink = `${baseUrl}/auth/verify?token=${token}&type=${type}`;
      }
    }
    
    console.log("Storing verification data in database");
    let verificationRecord;
    
    try {
      // Store the verification data in the database BEFORE sending the email
      const { data: storedData, error: insertError } = await supabase
        .from('email_verification_codes')
        .insert({
          email: email,
          code: code,
          token: token, // Store the token if using link-based verification
          type: type,
          expires_at: expiresAt.toISOString(),
          used: false
        })
        .select();
      
      if (insertError) {
        console.error("Error storing verification data:", insertError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to store verification data",
            details: insertError.message 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Verification data stored successfully:", storedData);
      verificationRecord = storedData?.[0];
    } catch (dbError) {
      console.error("Exception during database insertion:", dbError);
      return new Response(
        JSON.stringify({ 
          error: "Database error during verification setup",
          details: String(dbError)
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create the appropriate email content based on verification method
    let emailHtml = '';
    
    if (useLink) {
      // Link-based verification email
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">${headerText}</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
            Please click the button below to ${actionText}:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Verify My Email
            </a>
          </div>
          <p style="color: #4a4a4a; font-size: 14px;">
            If the button above doesn't work, you can copy and paste the following link into your browser:
          </p>
          <p style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; font-size: 14px; word-break: break-all;">
            ${verificationLink}
          </p>
          <p style="color: #4a4a4a; font-size: 14px;">
            This link will expire in 30 minutes. If you didn't request this verification, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} WillTank. All rights reserved.
          </p>
        </div>
      `;
    } else {
      // Code-based verification email (fallback)
      emailHtml = `
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
      `;
    }

    // Now send the email
    try {
      const emailResponse = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject: subject,
        html: emailHtml,
      });

      console.log("Email sent successfully:", { id: emailResponse?.id });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Verification ${useLink ? 'link' : 'code'} sent successfully`,
          emailId: emailResponse?.id,
          verificationId: verificationRecord?.id,
        }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (emailError) {
      console.error("Error sending email through Resend:", emailError);
      
      // Return partial success - we created the verification record but couldn't send the email
      return new Response(
        JSON.stringify({ 
          partialSuccess: true,
          error: "Email service error",
          verificationId: verificationRecord?.id,
          verificationToken: token,
          message: "Verification record created but email delivery failed" 
        }),
        {
          status: 202,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error in send-verification function:", error);
    
    // Provide better error details
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: "Failed to process verification request. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
