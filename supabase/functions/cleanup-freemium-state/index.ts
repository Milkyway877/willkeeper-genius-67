
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    console.log(`Cleaning up freemium state for user: ${user.email}`);

    // Check if user actually has an active subscription
    const { data: subscriptionData, error: subError } = await supabase.functions.invoke('check-subscription', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (subError || !subscriptionData?.subscribed) {
      return new Response(JSON.stringify({ 
        error: 'User does not have active subscription',
        subscribed: false 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Clean up all grace period and expiration flags
    const cleanupPromises = [
      // Clean wills
      supabase
        .from('wills')
        .update({ 
          deletion_scheduled: false,
          deletion_notified: false,
          grace_period_end: null,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id),

      // Clean tank messages  
      supabase
        .from('tank_messages')
        .update({ 
          deletion_scheduled: false,
          deletion_notified: false,
          grace_period_end: null,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id),

      // Clean monitoring records
      supabase
        .from('will_monitoring')
        .update({
          monitoring_status: 'active',
          scheduled_deletion: null,
          deletion_grace_period_end: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    ];

    const results = await Promise.allSettled(cleanupPromises);
    
    const errors = results
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      console.error('Some cleanup operations failed:', errors);
    }

    console.log(`Successfully cleaned up freemium state for user: ${user.email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Freemium state cleaned up successfully',
      timestamp: new Date().toISOString()
    }), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Cleanup freemium state error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
