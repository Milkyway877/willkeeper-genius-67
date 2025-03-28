
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
    const requestData = await req.json();
    const { user_id, email, first_name, last_name } = requestData;

    // Validate input
    if (!user_id) {
      console.error("Missing required field: user_id", requestData);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Missing required field: user_id is required",
          request: requestData
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // If email is not provided, try to get it from auth
    let userEmail = email;
    let firstName = first_name || "New";
    let lastName = last_name || "User";
    
    if (!userEmail) {
      console.log("Email not provided, fetching from auth");
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);
        
        if (userError) {
          console.error("Could not retrieve user email from auth:", userError);
          userEmail = `user_${user_id.substring(0, 8)}@placeholder.com`;
        } else if (!userData?.user?.email) {
          console.warn("Auth user found but no email present");
          userEmail = `user_${user_id.substring(0, 8)}@placeholder.com`;
        } else {
          userEmail = userData.user.email;
          
          // Also get first/last name if available
          if (userData.user.user_metadata?.first_name) {
            firstName = userData.user.user_metadata.first_name;
          }
          
          if (userData.user.user_metadata?.last_name) {
            lastName = userData.user.user_metadata.last_name;
          }
          
          console.log("Retrieved email and metadata from auth:", {
            email: userEmail,
            firstName,
            lastName
          });
        }
      } catch (authError) {
        console.error("Exception fetching auth user:", authError);
        userEmail = `user_${user_id.substring(0, 8)}@placeholder.com`;
      }
    }

    // Check if user already exists in the users table
    const { data: existingUser, error: checkError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user_id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking user existence:", checkError);
      // Continue anyway and try to create/update the user
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
    
    console.log("Creating new user profile for:", user_id, {
      email: userEmail,
      firstName,
      lastName
    });
    
    try {
      // Create user profile in the users table with password instead of passkey/recovery_phrase
      const { data: newUser, error: insertError } = await supabaseClient
        .from("users")
        .insert({
          id: user_id,
          email: userEmail,
          full_name: firstName,
          surname: lastName,
          passkey: "email_auth", // Default value since we're now using email auth
          recovery_phrase: "email_auth" // Default value since we're now using email auth
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating user profile:", insertError);
        
        // Check if error is due to a duplicate key (user might already exist)
        if (insertError.code === "23505") {
          // Try to fetch the user again, in case they were created in the meantime
          const { data: existingUserRetry, error: retryError } = await supabaseClient
            .from("users")
            .select("*")
            .eq("id", user_id)
            .maybeSingle();
            
          if (retryError) {
            console.error("Error in retry check for existing user:", retryError);
          }
            
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
