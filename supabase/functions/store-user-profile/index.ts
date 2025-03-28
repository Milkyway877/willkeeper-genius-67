
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
    console.log("store-user-profile function called");
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get request data
    const { user_id, email, first_name, last_name } = await req.json();

    // Validate input
    if (!user_id) {
      console.error("Missing required field: user_id");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Missing required field: user_id is required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // If email is not provided, try to get it from auth
    let userEmail = email;
    if (!userEmail) {
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);
      if (userError || !userData?.user?.email) {
        console.error("Could not retrieve user email from auth:", userError);
        userEmail = "unknown@example.com"; // Fallback
      } else {
        userEmail = userData.user.email;
      }
    }

    // Check if user already exists in the users table
    const { data: existingUser, error: checkError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user_id)
      .maybeSingle();

    if (checkError) {
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
      console.log("User already exists:", existingUser);
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
    
    console.log("Creating new user profile for:", user_id);
    
    try {
      // Create user profile in the users table
      const { data: newUser, error: insertError } = await supabaseClient
        .from("users")
        .insert({
          id: user_id,
          email: userEmail,
          full_name: first_name || "New",
          surname: last_name || "User",
          passkey: placeholderPasskey,
          recovery_phrase: placeholderRecoveryPhrase
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating user profile:", insertError);
        
        // Check if error is due to a duplicate key (user might already exist)
        if (insertError.code === "23505") {
          // Try to fetch the user again, in case they were created in the meantime
          const { data: existingUserRetry } = await supabaseClient
            .from("users")
            .select("*")
            .eq("id", user_id)
            .maybeSingle();
            
          if (existingUserRetry) {
            console.log("User profile already exists (retry check):", existingUserRetry);
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: "User already exists (caught by duplicate check)",
                user: existingUserRetry
              }),
              { 
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200 
              }
            );
          }
        }
        
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
    } catch (insertFatalError) {
      console.error("Fatal error while creating user:", insertFatalError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Fatal error while creating user profile",
          error: insertFatalError.message 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
