
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the Admin key
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface VerifyCodeRequest {
  email: string;
  code: string;
  isLogin: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Verify-code function called");
    
    // Parse request body
    let requestData: VerifyCodeRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const { email, code, isLogin } = requestData;
    
    if (!email || !code) {
      console.error("Missing required fields:", { email, code });
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Verifying code for email: ${email}, isLogin: ${isLogin}`);

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
      return new Response(
        JSON.stringify({ error: "Could not verify code: " + userError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      console.error("User not found for email:", email);
      return new Response(
        JSON.stringify({ error: "User does not exist" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Found user:", user.id);

    // Check if the verification code is valid
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from('email_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('email', email)
      .eq('code', code)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (verificationError || !verificationData) {
      console.error("Verification error:", verificationError?.message || "Invalid or expired code");
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Verification data found:", verificationData.id);

    // Mark the verification code as used
    const { error: updateError } = await supabaseAdmin
      .from('email_verifications')
      .update({ 
        is_used: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', verificationData.id);
    
    if (updateError) {
      console.error("Error updating verification:", updateError.message);
      return new Response(
        JSON.stringify({ error: "Could not update verification status: " + updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verification marked as used");

    // Update user profile status
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({ verification_status: 'verified' })
      .eq('id', user.id);
    
    if (profileError) {
      console.error("Error updating profile:", profileError.message);
      // Don't fail the whole process for this error, just log it
    } else {
      console.log("User profile updated");
    }

    // Create direct sign-in credentials
    try {
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.createSession({
        userId: user.id,
        properties: {
          custom_claim: 'verified_user'
        }
      });

      if (signInError) {
        console.error("Error creating session:", signInError.message);
        throw new Error("Could not create user session: " + signInError.message);
      }

      console.log("Created session successfully");

      // Log the verification activity
      try {
        await supabaseAdmin
          .from('user_activity')
          .insert({
            user_id: user.id,
            activity_type: isLogin ? 'email_verification_login' : 'email_verification_signup',
            details: { email: email },
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
          });
          
        console.log("Activity logged");
      } catch (activityError) {
        console.error("Error logging activity:", activityError);
        // Don't fail the whole process for this error
      }

      // Return the response with auth data
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email verified successfully",
          user: {
            id: user.id,
            email: user.email
          },
          session: signInData.session,
          isNewUser: !isLogin
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (sessionError) {
      console.error("Error in session creation:", sessionError);
      // Fall back to just responding with success but no session
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email verified successfully, but session couldn't be created",
          user: {
            id: user.id,
            email: user.email
          },
          isNewUser: !isLogin
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error in verify-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 200, // Still return 200 to prevent API calls from failing, but include error in body
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
