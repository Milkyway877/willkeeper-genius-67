
// Follow Deno deploy documentation here: https://deno.com/deploy/docs
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Store user profile function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    
    console.log("Received user record:", JSON.stringify(record));
    
    // At this point, the user is already registered in auth.users
    // We don't need to do anything special here anymore, as we're
    // no longer handling the TanKey or multi-step onboarding process
    
    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "User successfully registered"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in store-user-profile function:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
