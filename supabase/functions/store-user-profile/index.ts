
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get request data
    const { user_id, email, first_name, last_name } = await req.json();

    // Validate input
    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: user_id and email are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Check if user already exists in the users table
    const { data: existingUser, error: checkError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking user:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to check user existence",
          error: checkError 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // If user already exists, return success
    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User already exists",
          user: existingUser
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Generate placeholder values for required fields
    const placeholderPasskey = crypto.randomUUID();
    const placeholderRecoveryPhrase = "temporary_recovery_phrase";
    
    // Create user profile in the users table
    const { data: newUser, error: insertError } = await supabaseClient
      .from("users")
      .insert({
        id: user_id,
        email: email,
        full_name: first_name || "New",
        surname: last_name || "User",
        passkey: placeholderPasskey,
        recovery_phrase: placeholderRecoveryPhrase
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to create user profile",
          error: insertError 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    console.log("Successfully created user profile:", newUser);
    
    // Success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User profile created successfully",
        user: newUser
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
