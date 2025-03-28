
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

    // Hash the provided TanKey
    const hashedTanKey = await hashTanKey(tan_key);
    
    // Verify against stored TanKey
    const { data, error } = await supabaseClient
      .from("tan_keys")
      .select("*")
      .eq("user_id", user_id)
      .eq("tan_key", hashedTanKey)
      .single();

    if (error || !data) {
      console.error("Error verifying TanKey:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "TanKey verification failed" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    // Update last_used timestamp
    await supabaseClient
      .from("tan_keys")
      .update({ last_used: new Date().toISOString() })
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
