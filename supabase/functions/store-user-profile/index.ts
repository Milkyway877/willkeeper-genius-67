
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client function - extracted to reduce repeated code
const createSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

serve(async (req) => {
  console.log("store-user-profile function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create Supabase client
    const supabaseClient = createSupabaseClient();

    // Get request data
    const requestData = await req.json();
    console.log("Request data:", requestData);
    
    const { user_id, email, first_name, last_name } = requestData;

    // Basic validation
    if (!user_id) {
      console.error("Missing required field: user_id", requestData);
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

    // Determine user information
    let userEmail = email;
    let firstName = first_name || "New";
    let lastName = last_name || "User";
    
    // If email is not provided, try to get it from auth
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
          
          // Get metadata if available
          if (userData.user.user_metadata) {
            if (userData.user.user_metadata.first_name) {
              firstName = userData.user.user_metadata.first_name;
            }
            
            if (userData.user.user_metadata.last_name) {
              lastName = userData.user.user_metadata.last_name;
            }
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

    // Check if user already exists in the users table to avoid duplicate entries
    const { data: existingUser, error: checkError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user_id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking user existence:", checkError);
      // Continue anyway as the user might still not exist
    }

    // If user already exists, return success without trying to create again
    if (existingUser) {
      console.log("User already exists, returning:", existingUser);
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
    
    console.log("Creating new user profile:", {
      id: user_id,
      email: userEmail,
      firstName,
      lastName
    });
    
    // Create user profile with simplified values
    const { data: newUser, error: insertError } = await supabaseClient
      .from("users")
      .insert({
        id: user_id,
        email: userEmail,
        full_name: firstName,
        surname: lastName,
        passkey: "email_auth", 
        recovery_phrase: "email_auth"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      
      // Check if the error is due to duplicate key (may happen in race conditions)
      if (insertError.code === "23505") {
        // Try to fetch the existing user
        const { data: retryUser, error: retryError } = await supabaseClient
          .from("users")
          .select("*")
          .eq("id", user_id)
          .maybeSingle();
          
        if (retryError) {
          console.error("Error in retry check:", retryError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Database error when creating profile",
              error: insertError 
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500 
            }
          );
        }
          
        if (retryUser) {
          console.log("User already exists (caught via retry):", retryUser);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "User already exists (captured by retry)",
              user: retryUser
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200 
            }
          );
        }
      }
      
      // Handle a duplicate email error (if email is unique in table)
      if (insertError.code === "23505" && insertError.details?.includes("email")) {
        // Try updating the existing record instead if it's an email conflict
        const { data: updatedUser, error: updateError } = await supabaseClient
          .from("users")
          .update({
            full_name: firstName,
            surname: lastName
          })
          .eq("email", userEmail)
          .select()
          .single();
          
        if (updateError) {
          console.error("Error updating existing user:", updateError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Failed to update existing user profile",
              error: updateError 
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Updated existing user profile with same email",
            user: updatedUser
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }
      
      // Return error if we couldn't handle the issue
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
    
    // Return success response
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
    console.error("Unexpected error in store-user-profile:", error);
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
