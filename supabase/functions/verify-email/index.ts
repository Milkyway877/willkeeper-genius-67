
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { Resend } from "npm:resend@2.0.0";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the Admin key
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const resend = new Resend(resendApiKey);

interface EmailRequest {
  email: string;
  name?: string;
  isLogin: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, isLogin }: EmailRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { 
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the user from the email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError.message);
      throw new Error("Could not verify user");
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user && isLogin) {
      return new Response(
        JSON.stringify({ error: "User does not exist" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // For login, store the verification code in the database
    if (user) {
      const { error: insertError } = await supabaseAdmin
        .from('email_verifications')
        .insert({
          user_id: user.id,
          email,
          code: verificationCode,
          expires_at: expiresAt.toISOString()
        });
      
      if (insertError) {
        console.error("Error inserting verification:", insertError.message);
        throw new Error("Could not create verification");
      }
    }

    // Send email with the verification code
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'WillTank <noreply@willtank.com>',
      to: [email],
      subject: isLogin ? 'Verify Your Login - WillTank' : 'Verify Your Email - WillTank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3b82f6;">WillTank</h1>
          </div>

          <h2 style="color: #333; margin-bottom: 20px;">Verification Code</h2>
          
          <p style="color: #555; margin-bottom: 20px;">
            ${isLogin 
              ? 'To continue with your login, please enter the verification code below:' 
              : `Welcome to WillTank, ${name || 'New User'}! To complete your registration, please enter the verification code below:`
            }
          </p>
          
          <div style="background-color: #f5f7fb; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px dashed #d1d5db;">
            <h2 style="color: #3b82f6; letter-spacing: 5px; margin: 0; font-size: 32px;">
              ${verificationCode}
            </h2>
          </div>
          
          <p style="color: #555; margin-bottom: 20px;">
            This code will expire in 30 minutes. If you didn't request this code, you can safely ignore this email.
          </p>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px; text-align: center; color: #888; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} WillTank. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (emailError) {
      console.error("Email sending error:", emailError);
      throw new Error("Failed to send verification email");
    }

    console.log("Email sent successfully:", emailData);

    // Return the response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent successfully",
        verificationCode: verificationCode // Only for development purposes, remove in production
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in verify-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
