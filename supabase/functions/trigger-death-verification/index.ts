
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create death verification request
    const { data: verificationRequest, error: verificationError } = await supabase
      .from('death_verification_requests')
      .insert({
        user_id: userId,
        status: 'initiated',
        initiated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (verificationError) {
      throw new Error(`Verification request error: ${verificationError.message}`);
    }

    // Log the trigger
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'verification_triggered',
      details: {
        verification_request_id: verificationRequest.id,
        trigger_reason: 'missed_checkin_grace_period_exceeded'
      }
    });

    // Schedule trusted contact emails (immediate)
    setTimeout(async () => {
      await supabase.functions.invoke('send-trusted-contact-alerts', {
        body: { userId, verificationRequestId: verificationRequest.id }
      });
    }, 1000);

    // Schedule beneficiary emails (after 2 days)
    setTimeout(async () => {
      await supabase.functions.invoke('send-beneficiary-alerts', {
        body: { userId, verificationRequestId: verificationRequest.id }
      });
    }, 2 * 24 * 60 * 60 * 1000);

    // Schedule PIN generation (after 4 days)
    setTimeout(async () => {
      await supabase.functions.invoke('generate-unlock-pins', {
        body: { userId, verificationRequestId: verificationRequest.id }
      });
    }, 4 * 24 * 60 * 60 * 1000);

    return new Response(
      JSON.stringify({ 
        success: true, 
        verificationRequestId: verificationRequest.id,
        message: "Death verification process initiated"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in trigger-death-verification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
