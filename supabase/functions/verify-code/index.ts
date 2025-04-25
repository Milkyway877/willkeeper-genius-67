
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
  origin?: string; // Client origin for better redirection
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, code, isLogin, origin }: VerifyCodeRequest = await req.json();
    console.log("Verify code request:", { email, code, isLogin, origin });
    
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

    // Extract origin from request or use provided origin
    // First try to get origin from the Origin header
    const requestOrigin = req.headers.get('origin');
    // Then try from the Referer header
    const refererUrl = req.headers.get('referer');
    const refererOrigin = refererUrl ? new URL(refererUrl).origin : null;
    // Finally, use the provided origin or a default
    const clientOrigin = origin || requestOrigin || refererOrigin || '';
    
    console.log("Detected origins:", {
      requestOrigin,
      refererOrigin,
      providedOrigin: origin,
      finalOrigin: clientOrigin
    });
    
    // Default to a fallback URL if we can't determine the origin
    const baseUrl = clientOrigin || 'https://willrank.dev';
    const onboardingPath = `/auth/onboarding`;
    const redirectTo = `${baseUrl}${onboardingPath}`;
    
    console.log("Redirect destination:", redirectTo);
    
    // Create user session and return session data
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
      options: {
        redirectTo
      }
    });
    
    if (sessionError) {
      console.error("Error creating session:", sessionError.message);
      throw new Error("Could not create user session");
    }

    console.log("Generated auth link:", sessionData.properties?.action_link);

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

    // Return the response with auth link
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email verified successfully",
        user: {
          id: user.id,
          email: user.email
        },
        isNewUser: user.created_at === user.updated_at, // If created_at equals updated_at, user is new
        authLink: sessionData.properties?.action_link,
        redirectTo: onboardingPath
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
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
