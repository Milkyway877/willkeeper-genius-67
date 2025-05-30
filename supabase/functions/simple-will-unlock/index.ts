
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
    const { unlockCode, executorDetails } = await req.json();
    
    if (!unlockCode || !executorDetails) {
      return new Response(
        JSON.stringify({ error: "Missing unlock code or executor details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the unlock code
    const { data: unlockRecord, error: unlockError } = await supabase
      .from('will_unlock_codes')
      .select('*')
      .eq('unlock_code', unlockCode.toUpperCase())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (unlockError || !unlockRecord) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid or expired unlock code" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark the code as used
    await supabase
      .from('will_unlock_codes')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', unlockRecord.id);

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', unlockRecord.user_id)
      .single();

    if (userError || !userProfile) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unable to retrieve user information" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get will information
    const { data: wills, error: willsError } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', unlockRecord.user_id);

    // Get beneficiaries
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('will_beneficiaries')
      .select('*')
      .eq('user_id', unlockRecord.user_id);

    // Get executors
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', unlockRecord.user_id);

    // Log the access
    await supabase.from('death_verification_logs').insert({
      user_id: unlockRecord.user_id,
      action: 'will_unlocked_by_executor',
      details: {
        unlock_code: unlockCode,
        executor_details: executorDetails,
        access_timestamp: new Date().toISOString(),
        verification_id: unlockRecord.id
      }
    });

    // Create will package
    const willPackage = {
      deceased: {
        name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
        email: userProfile.email,
        id: userProfile.id
      },
      wills: wills || [],
      beneficiaries: beneficiaries || [],
      executors: executors || [],
      unlockDetails: {
        unlockedAt: new Date().toISOString(),
        unlockedBy: executorDetails,
        unlockCode: unlockCode
      },
      instructions: "This package contains the complete will and beneficiary information for the deceased person. Please handle with care and in accordance with legal requirements."
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        willPackage,
        message: "Will successfully unlocked"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in simple-will-unlock:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
