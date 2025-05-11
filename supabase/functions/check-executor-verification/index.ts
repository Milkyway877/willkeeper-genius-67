
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { verificationId } = await req.json();
    
    if (!verificationId) {
      return new Response(
        JSON.stringify({ error: "Missing verification ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Call the database function to check verification status
    const { data: verification, error } = await supabase.rpc(
      'check_executor_verification',
      { verification_id: verificationId }
    );
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!verification) {
      return new Response(
        JSON.stringify({ error: "Verification not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if verification has expired
    const now = new Date();
    const expiresAt = new Date(verification.expires_at);
    const isExpired = now > expiresAt;
    
    if (isExpired) {
      // Update verification status to expired
      await supabase
        .from('executor_verifications')
        .update({ status: 'expired' })
        .eq('id', verificationId);
        
      return new Response(
        JSON.stringify({
          success: false,
          expired: true,
          error: "Verification session has expired"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If pins_received equals pins_required, update status to completed
    if (verification.pins_received >= verification.pins_required && verification.status !== 'completed') {
      await supabase
        .from('executor_verifications')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', verificationId);
        
      verification.status = 'completed';
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        verification
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking verification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
