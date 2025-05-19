
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
    const { checkInId } = await req.json() as { checkInId: string };
    
    if (!checkInId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing check-in ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get check-in message
    const { data: checkIn, error: checkInError } = await supabase
      .from('future_messages')
      .select('*')
      .eq('id', checkInId)
      .single();
      
    if (checkInError || !checkIn) {
      return new Response(
        JSON.stringify({ success: false, message: "Check-in not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update the check-in response timestamp
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('future_messages')
      .update({
        last_check_in_response: now,
        updated_at: now
      })
      .eq('id', checkInId);
      
    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, message: "Failed to update check-in status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create a notification about the check-in response
    try {
      await supabase.rpc(
        'create_notification',
        {
          p_user_id: checkIn.user_id,
          p_title: 'Check-in Confirmed',
          p_description: 'You have successfully responded to your check-in',
          p_type: 'check_in_completed'
        }
      );
    } catch (error) {
      console.error('Error creating notification:', error);
      // Continue even if notification fails
    }
    
    // Log the check-in response
    await supabase.from('death_verification_logs').insert({
      user_id: checkIn.user_id,
      action: 'check_in_response',
      details: {
        check_in_id: checkInId,
        check_in_title: checkIn.title,
        responded_at: now
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Check-in confirmed",
        timestamp: now
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error confirming check-in:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: "Error processing request", error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
