
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VerificationResponse {
  token: string;
  response: 'alive' | 'dead';
  pinCode: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the verification response data from the request
    const { token, response, pinCode } = await req.json() as VerificationResponse;
    
    if (!token || !response) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // First, get the verification access record using the token
    const { data: accessData, error: accessError } = await supabase
      .from('public_verification_access')
      .select('*')
      .eq('verification_token', token)
      .single();
    
    if (accessError || !accessData) {
      return new Response(
        JSON.stringify({ error: "Invalid verification token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the verification request
    const { data: requestData, error: requestError } = await supabase
      .from('death_verification_requests')
      .select('*')
      .eq('id', accessData.request_id)
      .single();
    
    if (requestError || !requestData) {
      return new Response(
        JSON.stringify({ error: "Verification request not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If the response is 'alive', cancel the verification request
    if (response === 'alive') {
      // Update the request status to 'canceled'
      const { error: updateError } = await supabase
        .from('death_verification_requests')
        .update({ status: 'canceled' })
        .eq('id', requestData.id);
      
      if (updateError) {
        console.error("Error updating request status:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to process verification" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create a new check-in for the user
      const { data: settingsData } = await supabase
        .from('death_verification_settings')
        .select('check_in_frequency')
        .eq('user_id', requestData.user_id)
        .single();
      
      const checkInFrequency = settingsData?.check_in_frequency || 7;
      
      const now = new Date();
      const nextCheckIn = new Date(now);
      nextCheckIn.setDate(nextCheckIn.getDate() + checkInFrequency);
      
      const { error: checkinError } = await supabase
        .from('death_verification_checkins')
        .insert({
          user_id: requestData.user_id,
          status: 'alive',
          checked_in_at: now.toISOString(),
          next_check_in: nextCheckIn.toISOString()
        });
      
      if (checkinError) {
        console.error("Error creating check-in:", checkinError);
      }
      
      // Log the action
      await supabase
        .from('death_verification_logs')
        .insert({
          user_id: requestData.user_id,
          action: 'verification_canceled',
          details: {
            request_id: requestData.id,
            verification_token: token,
            canceled_at: new Date().toISOString(),
          },
        });
      
      return new Response(
        JSON.stringify({ success: true, message: "Verification canceled, user confirmed alive" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // If the response is 'dead', we need to validate the PIN code
      if (!pinCode) {
        return new Response(
          JSON.stringify({ error: "PIN code required for death verification" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Find PIN code in the database
      // This is a simplified version - in a real system, you'd check against specific beneficiary/executor
      const { data: pinData, error: pinError } = await supabase
        .from('death_verification_pins')
        .select('*')
        .eq('pin_code', pinCode)
        .eq('used', false)
        .single();
      
      if (pinError || !pinData) {
        return new Response(
          JSON.stringify({ error: "Invalid PIN code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Mark the PIN as used
      const { error: pinUpdateError } = await supabase
        .from('death_verification_pins')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', pinData.id);
      
      if (pinUpdateError) {
        console.error("Error updating PIN status:", pinUpdateError);
      }
      
      // Record the verification response
      const { error: responseError } = await supabase
        .from('death_verification_responses')
        .insert({
          request_id: requestData.id,
          responder_id: pinData.person_id,
          response: 'dead'
        });
      
      if (responseError) {
        console.error("Error recording response:", responseError);
        return new Response(
          JSON.stringify({ error: "Failed to record verification response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if enough verifications have been received
      const { data: responsesData } = await supabase
        .from('death_verification_responses')
        .select('id')
        .eq('request_id', requestData.id)
        .eq('response', 'dead');
      
      const responseCount = responsesData?.length || 0;
      
      // For this example, let's say we need at least 2 verifications
      // In a real system, this would be configurable
      if (responseCount >= 2) {
        // Update the request status to 'verified'
        await supabase
          .from('death_verification_requests')
          .update({ status: 'verified' })
          .eq('id', requestData.id);
        
        // Log the verification
        await supabase
          .from('death_verification_logs')
          .insert({
            user_id: requestData.user_id,
            action: 'death_verified',
            details: {
              request_id: requestData.id,
              verification_count: responseCount,
              verified_at: new Date().toISOString(),
            },
          });
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "Verification response recorded" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error processing verification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
