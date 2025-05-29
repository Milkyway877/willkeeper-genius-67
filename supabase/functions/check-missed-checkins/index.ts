
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
    console.log("Checking for missed check-ins...");
    
    // Get all users with check-ins enabled
    const { data: settings, error: settingsError } = await supabase
      .from('death_verification_settings')
      .select('user_id, check_in_frequency, grace_period')
      .eq('check_in_enabled', true);

    if (settingsError) {
      throw new Error(`Settings error: ${settingsError.message}`);
    }

    if (!settings || settings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with check-ins enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processedUsers = 0;
    let triggeredVerifications = 0;

    for (const setting of settings) {
      try {
        // Get latest check-in for this user
        const { data: latestCheckin } = await supabase
          .from('death_verification_checkins')
          .select('*')
          .eq('user_id', setting.user_id)
          .order('checked_in_at', { ascending: false })
          .limit(1)
          .single();

        if (!latestCheckin) continue;

        const now = new Date();
        const nextCheckInDue = new Date(latestCheckin.next_check_in);
        const gracePeriodEnd = new Date(nextCheckInDue.getTime() + (setting.grace_period * 24 * 60 * 60 * 1000));

        // Check if we're past the grace period
        if (now > gracePeriodEnd) {
          // Check if verification already triggered
          const { data: existingVerification } = await supabase
            .from('death_verification_requests')
            .select('id')
            .eq('user_id', setting.user_id)
            .eq('status', 'initiated')
            .single();

          if (!existingVerification) {
            // Trigger death verification process
            await supabase.functions.invoke('trigger-death-verification', {
              body: { userId: setting.user_id }
            });

            triggeredVerifications++;
            console.log(`Triggered verification for user: ${setting.user_id}`);
          }
        }

        processedUsers++;
      } catch (error) {
        console.error(`Error processing user ${setting.user_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedUsers, 
        triggeredVerifications,
        message: `Processed ${processedUsers} users, triggered ${triggeredVerifications} verifications`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-missed-checkins:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
