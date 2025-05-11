
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
    const { verificationId, pins } = await req.json();
    
    if (!verificationId || !pins || !Array.isArray(pins)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get verification record
    const { data: verification, error: verificationError } = await supabase
      .from('executor_verifications')
      .select('*')
      .eq('id', verificationId)
      .single();
    
    if (verificationError || !verification) {
      return new Response(
        JSON.stringify({ error: "Verification session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if verification has expired
    const now = new Date();
    const expiresAt = new Date(verification.expires_at);
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({
          success: false,
          expired: true,
          error: "Verification session has expired"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get all pins for this verification
    const { data: storedPins, error: pinsError } = await supabase
      .from('executor_access_pins')
      .select('*')
      .eq('verification_id', verificationId)
      .order('pin_index', { ascending: true });
    
    if (pinsError) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve PINs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!storedPins || storedPins.length === 0) {
      return new Response(
        JSON.stringify({ error: "No PINs found for this verification" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if we have enough PINs
    if (pins.length < storedPins.length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Not enough PINs provided. Expected ${storedPins.length}, got ${pins.length}`
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate PINs
    const invalidIndices: number[] = [];
    const validPinIds: string[] = [];
    
    for (let i = 0; i < storedPins.length; i++) {
      if (i >= pins.length) {
        invalidIndices.push(i);
        continue;
      }
      
      const submittedPin = pins[i].trim();
      const storedPin = storedPins[i].pin;
      
      if (submittedPin !== storedPin) {
        invalidIndices.push(i);
      } else {
        validPinIds.push(storedPins[i].id);
      }
    }
    
    // Update status of valid pins
    if (validPinIds.length > 0) {
      await supabase
        .from('executor_access_pins')
        .update({
          status: 'used',
          used_at: new Date().toISOString()
        })
        .in('id', validPinIds);
    }
    
    // If all pins are valid, update verification status
    if (invalidIndices.length === 0) {
      await supabase
        .from('executor_verifications')
        .update({
          status: 'completed',
          pins_received: storedPins.length,
          completed_at: new Date().toISOString()
        })
        .eq('id', verificationId);
      
      // Log successful verification
      await supabase.from('death_verification_logs').insert({
        user_id: verification.user_id,
        action: 'executor_verification_completed',
        details: {
          verification_id: verificationId,
          executor_id: verification.executor_id
        }
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "All PINs verified successfully"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Some pins were invalid
      return new Response(
        JSON.stringify({
          success: false,
          invalidPins: invalidIndices,
          message: `${invalidIndices.length} PIN${invalidIndices.length > 1 ? 's were' : ' was'} incorrect`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error submitting PINs:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
