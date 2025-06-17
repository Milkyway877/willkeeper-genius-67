
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

    // 1. Remove all scheduled deletions for this user's wills
    const { data: willsUpdated, error: willsError } = await supabase
      .from('wills')
      .update({ 
        deletion_scheduled: false,
        deletion_notified: false,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('deletion_scheduled', true);

    if (willsError) {
      console.error('Error updating wills:', willsError);
    } else {
      console.log(`Updated ${willsUpdated?.length || 0} wills for user ${user_email}`);
    }

    // 2. Remove all scheduled deletions for this user's tank messages
    const { data: messagesUpdated, error: messagesError } = await supabase
      .from('tank_messages')
      .update({ 
        deletion_scheduled: false,
        deletion_notified: false,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('deletion_scheduled', true);

    if (messagesError) {
      console.error('Error updating tank messages:', messagesError);
    } else {
      console.log(`Updated ${messagesUpdated?.length || 0} tank messages for user ${user_email}`);
    }

    // 3. Update all monitoring records for this user
    const { data: monitoringUpdated, error: monitoringError } = await supabase
      .from('will_monitoring')
      .update({
        monitoring_status: 'active',
        scheduled_deletion: null,
        deletion_grace_period_end: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .in('monitoring_status', ['deletion_pending', 'grace_period']);

    if (monitoringError) {
      console.error('Error updating monitoring records:', monitoringError);
    } else {
      console.log(`Updated ${monitoringUpdated?.length || 0} monitoring records for user ${user_email}`);
    }

    // 4. Clear any freemium restriction flags
    const { error: freemiumError } = await supabase
      .from('user_freemium_status')
      .upsert({
        user_id,
        grace_period_active: false,
        content_expired: false,
        last_upgrade_check: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (freemiumError) {
      console.error('Error updating freemium status:', freemiumError);
    }

    // 5. Create welcome notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type: 'subscription_activated',
        title: '🎉 Welcome to WillTank Premium!',
        message: 'Your subscription is now active. Your wills and messages are permanently protected and all premium features are unlocked.',
        read: false,
        created_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    console.log(`Successfully processed subscription upgrade for user: ${user_email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Subscription upgrade processed successfully',
      details: {
        wills_updated: willsUpdated?.length || 0,
        messages_updated: messagesUpdated?.length || 0,
        monitoring_updated: monitoringUpdated?.length || 0
      },
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
