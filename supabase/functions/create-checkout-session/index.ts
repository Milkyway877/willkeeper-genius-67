
// This Stripe Edge Function has been removed
// The file remains to prevent 404 errors if it's referenced elsewhere

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  return new Response(
    JSON.stringify({ 
      error: "Stripe payment processing has been disabled" 
    }),
    {
      status: 200,
      headers: corsHeaders
    }
  );
});
