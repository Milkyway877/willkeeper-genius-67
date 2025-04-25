import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailRequest {
  email: string;
  type: 'signup' | 'login';
  firstName?: string;
}

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createEmailHtml = (code: string, firstName?: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <img src="https://ksiinmxsycosnpchutuw.supabase.co/storage/v1/object/public/email-assets/willtank-logo-secure.png" 
               alt="WillTank Logo" 
               style="display: block; margin: 0 auto; max-width: 200px; height: auto;">
          
          <h1 style="color: #333; text-align: center; margin-top: 20px;">
            Hello ${firstName ? firstName : 'there'}!
          </h1>
          
          <p style="color: #666; text-align: center; font-size: 16px;">
            Here is your verification code:
          </p>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">
              ${code}
            </span>
          </div>
          
          <p style="color: #999; text-align: center; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #999; text-align: center; font-size: 12px;">
            This is an automated message from WillTank. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, type, firstName }: EmailRequest = requestBody;

    if (!email || !type) {
      console.error("Missing required parameters: email and type");
      return new Response(
        JSON.stringify({ success: false, error: "Email and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing verification email for ${email}, type: ${type}`);

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: existingCodes, error: fetchError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('type', type)
      .eq('used', false);

    if (fetchError) {
      console.error('Error checking for existing codes:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to check for existing verification codes" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingCodes && existingCodes.length > 0) {
      const { error: updateError } = await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('email', email)
        .eq('type', type)
        .eq('used', false);
      
      if (updateError) {
        console.error('Error updating existing codes:', updateError);
      }
    }

    const { error: dbError } = await supabase
      .from('email_verification_codes')
      .insert([
        {
          email,
          code: verificationCode,
          type,
          expires_at: expiresAt,
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to store verification code" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const emailResponse = await resend.emails.send({
        from: "WillTank <support@willtank.com>",
        to: [email],
        subject: type === 'signup' ? "Verify Your WillTank Account" : "Your WillTank Login Code",
        html: createEmailHtml(verificationCode, firstName),
      });

      console.log('Email sent successfully:', emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Verification code sent successfully",
          data: {
            email_id: emailResponse?.id || 'unknown'
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: emailError.message || "Unknown email error" 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
