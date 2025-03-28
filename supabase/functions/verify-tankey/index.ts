
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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get request data
    const { user_id, tan_key } = await req.json();

    // Validate input
    if (!user_id || !tan_key) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: user_id and tan_key are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Get the stored TanKey
    const { data, error } = await supabaseClient
      .from("tan_keys")
      .select("tan_key")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      console.error("Error retrieving TanKey:", error);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve TanKey" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "No TanKey found for this user" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }

    // Hash the provided TanKey for comparison
    const hashedTanKey = await hashTanKey(tan_key);

    // Compare the hashed TanKey with the stored one
    if (hashedTanKey !== data.tan_key) {
      return new Response(
        JSON.stringify({ error: "Invalid TanKey" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    // Update the last_used timestamp
    // (The trigger we created will automatically update the last_used timestamp)
    await supabaseClient
      .from("tan_keys")
      .update({})
      .eq("user_id", user_id);

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "TanKey verified successfully" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
