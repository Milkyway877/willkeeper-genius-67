
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
    const { email, code, isLogin }: VerifyCodeRequest = await req.json();
    
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

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
      throw new Error("Could not verify code");
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User does not exist" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

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
      throw new Error("Could not update verification status");
    }

    // Update user profile status
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({ verification_status: 'verified' })
      .eq('id', user.id);
    
    if (profileError) {
      console.error("Error updating profile:", profileError.message);
      throw new Error("Could not update profile status");
    }

    // Determine the application URL for redirection
    // Try multiple sources to get the application URL
    const origin = req.headers.get('origin') || 
                  req.headers.get('referer')?.replace(/\/[^/]*$/, '') || 
                  'https://lovable.dev';
    
    console.log("Origin for redirection:", origin);

    // Create direct sign-in credentials instead of magic link
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.createSession({
      userId: user.id,
      properties: {
        custom_claim: 'verified_user'
      }
    });

    if (signInError) {
      console.error("Error creating session:", signInError.message);
      throw new Error("Could not create user session");
    }

    // Log the verification activity
    const { error: activityError } = await supabaseAdmin
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: isLogin ? 'email_verification_login' : 'email_verification_signup',
        details: { email: email },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
      });
    
    if (activityError) {
      console.error("Error logging activity:", activityError.message);
      // Don't throw, just log the error as this is not critical
    }

    // Return the response with auth data for client-side handling
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email verified successfully",
        user: {
          id: user.id,
          email: user.email
        },
        session: signInData?.session,
        isNewUser: user.created_at === user.updated_at, // If created_at equals updated_at, user is new
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in verify-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
