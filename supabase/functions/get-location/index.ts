
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const { lat, lng } = await req.json();

    // Validate input
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: lat and lng are required"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Use Google Maps Geocoding API to get location details
    const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_API");
    
    if (!googleMapsApiKey) {
      throw new Error("Google Maps API key not configured");
    }

    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    // Extract city and country from geocoding results
    let city = "";
    let country = "";

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      
      for (const component of addressComponents) {
        if (component.types.includes("locality")) {
          city = component.long_name;
        } else if (component.types.includes("country")) {
          country = component.long_name;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        city, 
        country,
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
