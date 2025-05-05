
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS if needed
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token, email, type } = await req.json();

    if (!token || !email || !type) {
      return new Response(
        JSON.stringify({
          status: "invalid",
          message: "Missing required parameters",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if the verification token is valid
    const { data: verificationData, error: verificationError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("email", email)
      .eq("verification_token", token)
      .eq("type", type)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (verificationError || !verificationData) {
      console.error("Verification error:", verificationError);
      return new Response(
        JSON.stringify({
          status: "invalid",
          message: "Invalid or expired verification token",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Mark the verification code as used
    const { error: updateError } = await supabase
      .from("email_verification_codes")
      .update({
        used: true,
        link_clicked: true,
      })
      .eq("verification_token", token)
      .eq("email", email);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Failed to update verification status",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    let message = "Email verified successfully";
    let action = "verified";

    // Handle different verification types
    if (type === "signup") {
      // For signup, verify the user's email in auth.users if needed
      action = "account_created";
      message = "Your account has been created and email verified";
    } else if (type === "login") {
      // For login, simply acknowledge the verification
      action = "logged_in";
      message = "You are now verified and can sign in";
    } else if (type === "recovery") {
      action = "recovery_verified";
      message = "Your account recovery request has been verified";
    }

    // Return success response
    return new Response(
      JSON.stringify({
        status: "verified",
        message,
        action,
        email,
        type,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in verify-email function:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
