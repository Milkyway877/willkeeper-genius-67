
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { user_id, user_email } = await req.json();

    console.log(`Processing subscription upgrade for user: ${user_email}`);

    // Remove all scheduled deletions for this user
    await supabase
      .from('wills')
      .update({ 
        deletion_scheduled: false,
        deletion_notified: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('deletion_scheduled', true);

    // Update all monitoring records for this user
    await supabase
      .from('will_monitoring')
      .update({
        monitoring_status: 'active',
        scheduled_deletion: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .in('monitoring_status', ['deletion_pending', 'grace_period']);

    // Create welcome notification
    await supabase
      .from('notifications')
      .insert({
        user_id,
        type: 'subscription_activated',
        title: '🎉 Welcome to WillTank!',
        message: 'Your subscription is now active. Your wills are permanently protected and all premium features are unlocked.',
        created_at: new Date().toISOString()
      });

    console.log(`Successfully processed subscription upgrade for user: ${user_email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Subscription upgrade processed successfully',
      timestamp: new Date().toISOString()
    }), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Handle subscription upgrade error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
