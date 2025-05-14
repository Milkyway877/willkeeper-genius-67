
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AccessRequest {
  token: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json() as AccessRequest;
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the verification access record
    const { data: accessData, error: accessError } = await supabase
      .from('public_verification_access')
      .select(`
        id,
        request_id,
        expires_at,
        used,
        death_verification_requests (
          id,
          user_id,
          status
        )
      `)
      .eq('verification_token', token)
      .single();
    
    if (accessError || !accessData) {
      return new Response(
        JSON.stringify({ error: "Invalid access token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const request = accessData.death_verification_requests;
    
    // Check if access is still valid
    const now = new Date();
    const expiresAt = new Date(accessData.expires_at);
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: "Access has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if verification is complete
    if (request.status !== 'verified') {
      return new Response(
        JSON.stringify({ error: "Verification is not complete" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Mark access as used
    const { error: updateError } = await supabase
      .from('public_verification_access')
      .update({
        used: true,
        used_at: now.toISOString()
      })
      .eq('id', accessData.id);
    
    if (updateError) {
      console.error("Error updating access status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to process access" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Log the access
    await supabase
      .from('death_verification_logs')
      .insert({
        user_id: request.user_id,
        action: 'documents_accessed',
        details: {
          request_id: request.id,
          access_id: accessData.id,
          accessed_at: now.toISOString(),
        },
      });
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Access granted to documents"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing access:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
