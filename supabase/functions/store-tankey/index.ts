
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash the TanKey securely (SHA-256)
async function hashTanKey(tanKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(tanKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("store-tankey function called");
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get request data
    const requestData = await req.json();
    const { user_id, tan_key } = requestData;

    // Validate input
    if (!user_id || !tan_key) {
      console.error("Missing required fields: user_id or tan_key", { 
        user_id_exists: !!user_id, 
        tan_key_exists: !!tan_key 
      });
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Missing required fields: user_id and tan_key are required",
          request: { 
            user_id_exists: !!user_id, 
            tan_key_exists: !!tan_key 
          }
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // First check if the user exists in the users table
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("id, email")
      .eq("id", user_id)
      .maybeSingle();

    // If the user doesn't exist, try to create a basic profile
    if (!userData) {
      console.log("User not found in users table, attempting to create profile");
      
      try {
        // Get user details from auth
        const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(user_id);
        
        if (authError) {
          console.error("Error fetching auth user:", authError);
          
          // Try to proceed anyway with minimal information
          try {
            // Insert user into users table with minimum data
            const { data: insertedUser, error: insertError } = await supabaseClient
              .from("users")
              .insert({
                id: user_id,
                email: "user_" + user_id.substring(0, 8) + "@placeholder.com",
                full_name: "New",
                surname: "User",
                passkey: tan_key,
                recovery_phrase: "temporary_recovery_phrase"
              })
              .select()
              .single();
              
            if (insertError) {
              console.error("Failed to create minimum user profile:", insertError);
              
              // If it's not a duplicate key error, return error
              if (insertError.code !== "23505") {
                return new Response(
                  JSON.stringify({ 
                    success: false, 
                    message: "Failed to create user profile and auth user not found",
                    error: insertError 
                  }),
                  { 
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 500 
                  }
                );
              } 
              console.log("Duplicate key error - likely a race condition");
            } else {
              console.log("Created placeholder user profile with minimal data");
            }
          } catch (minProfileError) {
            console.error("Error creating minimal profile:", minProfileError);
          }
        } else if (!authUser?.user) {
          console.error("Auth user object is empty or undefined");
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "User not found in auth system",
              error: "Auth user object is empty"
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404 
            }
          );
        } else {
          console.log("Auth user found, creating profile in database");
          
          // Insert user into users table with auth data
          const { error: insertError } = await supabaseClient
            .from("users")
            .insert({
              id: user_id,
              email: authUser.user.email || "unknown@example.com",
              full_name: authUser.user.user_metadata?.first_name || "New",
              surname: authUser.user.user_metadata?.last_name || "User",
              passkey: tan_key,
              recovery_phrase: "temporary_recovery_phrase"
            });
            
          if (insertError) {
            console.error("Error creating user profile:", insertError);
            
            // Special case: if the error is a duplicate key, the user was probably created in a race condition
            if (insertError.code !== "23505") {
              console.error("Failed to create user profile, non-duplicate error");
            } else {
              console.log("Duplicate key error - user profile created in another request");
            }
          } else {
            console.log("Created user profile from auth data");
          }
        }
      } catch (profileError) {
        console.error("Unexpected error in profile creation:", profileError);
      }
    } else {
      console.log("User found in database:", userData.id);
    }

    // Hash the TanKey before storing in tan_keys table
    const hashedTanKey = await hashTanKey(tan_key);
    
    console.log("Storing hashed TanKey for user:", user_id);
    
    // Store the hashed TanKey in the tan_keys table
    const { error: tanKeyError } = await supabaseClient
      .from("tan_keys")
      .upsert(
        { 
          user_id, 
          tan_key: hashedTanKey 
        },
        { 
          onConflict: "user_id" 
        }
      );

    if (tanKeyError) {
      console.error("Error storing TanKey in tan_keys table:", tanKeyError);
      // Continue anyway to try updating the users table
    } else {
      console.log("TanKey stored in tan_keys table");
    }

    // Also update the user's passkey in the users table
    const { error: updateError } = await supabaseClient
      .from("users")
      .update({ passkey: tan_key })
      .eq("id", user_id);

    if (updateError) {
      console.error("Error updating passkey in users table:", updateError);
      
      // If both operations failed, return an error
      if (tanKeyError) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to store TanKey in both tables",
            details: { tanKeyError, updateError }
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }
    } else {
      console.log("Passkey updated in users table");
    }

    // Success if either operation succeeded
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "TanKey stored successfully" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Unexpected error in store-tankey:", error);
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
