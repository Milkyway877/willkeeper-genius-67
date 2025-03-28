
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    // Get client IP address
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    
    // Use a free IP geolocation API
    const response = await fetch(`https://ipapi.co/${clientIP}/json/`);
    const locationData = await response.json();

    // Extract relevant data
    const city = locationData.city || "";
    const country = locationData.country_name || "";

    return new Response(
      JSON.stringify({ 
        city, 
        country,
        // Include additional data for logging/debugging
        ip: clientIP,
        region: locationData.region || "",
        timezone: locationData.timezone || ""
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("IP location error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
