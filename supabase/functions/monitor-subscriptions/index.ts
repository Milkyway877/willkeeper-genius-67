
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

interface WillMonitoringRecord {
  id: string;
  user_id: string;
  will_id: string;
  monitoring_status: string;
  scheduled_deletion: string | null;
  notifications_sent: number;
  last_notification_sent: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
    console.error("Missing required environment variables");
    return new Response(JSON.stringify({ error: "Server configuration error" }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  try {
    console.log("Starting subscription monitoring cycle...");

    // Get all wills that need monitoring (created in last 25 hours, not deleted)
    const { data: willsToMonitor, error: willsError } = await supabase
      .from('wills')
      .select(`
        id, user_id, title, created_at, subscription_required_after, 
        deletion_scheduled, deletion_notified,
        profiles!inner(email)
      `)
      .eq('deletion_scheduled', false)
      .gte('created_at', new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString());

    if (willsError) {
      throw new Error(`Failed to fetch wills: ${willsError.message}`);
    }

    console.log(`Found ${willsToMonitor?.length || 0} wills to monitor`);

    for (const will of willsToMonitor || []) {
      try {
        const userEmail = will.profiles.email;
        console.log(`Checking subscription for user: ${userEmail}, will: ${will.id}`);

        // Check if user has active subscription
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        let hasActiveSubscription = false;

        if (customers.data.length > 0) {
          const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            status: 'active',
            limit: 1
          });
          hasActiveSubscription = subscriptions.data.length > 0;
        }

        console.log(`User ${userEmail} has active subscription: ${hasActiveSubscription}`);

        if (hasActiveSubscription) {
          // User is subscribed, remove from monitoring
          await supabase
            .from('will_monitoring')
            .delete()
            .eq('will_id', will.id);
          
          console.log(`Removed monitoring for subscribed user: ${userEmail}`);
          continue;
        }

        // Check if 24 hours have passed
        const subscriptionDeadline = new Date(will.subscription_required_after);
        const now = new Date();
        const timeRemaining = subscriptionDeadline.getTime() - now.getTime();

        if (timeRemaining <= 0) {
          // Time's up - schedule for deletion
          console.log(`Scheduling will ${will.id} for deletion - deadline passed`);
          
          await supabase
            .from('wills')
            .update({ 
              deletion_scheduled: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', will.id);

          // Update monitoring record
          await supabase
            .from('will_monitoring')
            .upsert({
              user_id: will.user_id,
              will_id: will.id,
              monitoring_status: 'deletion_pending',
              scheduled_deletion: new Date(now.getTime() + 5 * 60 * 1000).toISOString(), // 5 minutes grace
              updated_at: new Date().toISOString()
            });

          // Send final notification
          await supabase.functions.invoke('send-deletion-notifications', {
            body: {
              user_id: will.user_id,
              will_id: will.id,
              notification_type: 'final_warning',
              user_email: userEmail,
              will_title: will.title
            }
          });

        } else {
          // Still in monitoring period - send appropriate notifications
          const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
          
          // Get or create monitoring record
          let { data: monitoringRecord } = await supabase
            .from('will_monitoring')
            .select('*')
            .eq('will_id', will.id)
            .single();

          if (!monitoringRecord) {
            const { data: newRecord } = await supabase
              .from('will_monitoring')
              .insert({
                user_id: will.user_id,
                will_id: will.id,
                monitoring_status: 'active',
                notifications_sent: 0
              })
              .select()
              .single();
            
            monitoringRecord = newRecord;
          }

          // Determine if we should send a notification
          let shouldNotify = false;
          let notificationType = 'reminder';

          if (hoursRemaining <= 1 && monitoringRecord.notifications_sent < 4) {
            shouldNotify = true;
            notificationType = 'critical';
          } else if (hoursRemaining <= 4 && monitoringRecord.notifications_sent < 3) {
            shouldNotify = true;
            notificationType = 'urgent';
          } else if (hoursRemaining <= 12 && monitoringRecord.notifications_sent < 2) {
            shouldNotify = true;
            notificationType = 'warning';
          } else if (hoursRemaining <= 23 && monitoringRecord.notifications_sent < 1) {
            shouldNotify = true;
            notificationType = 'reminder';
          }

          if (shouldNotify) {
            console.log(`Sending ${notificationType} notification for will ${will.id}`);
            
            await supabase.functions.invoke('send-deletion-notifications', {
              body: {
                user_id: will.user_id,
                will_id: will.id,
                notification_type: notificationType,
                user_email: userEmail,
                will_title: will.title,
                hours_remaining: hoursRemaining
              }
            });

            // Update monitoring record
            await supabase
              .from('will_monitoring')
              .update({
                notifications_sent: monitoringRecord.notifications_sent + 1,
                last_notification_sent: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', monitoringRecord.id);
          }
        }

      } catch (error) {
        console.error(`Error processing will ${will.id}:`, error);
      }
    }

    console.log("Subscription monitoring cycle completed");

    return new Response(JSON.stringify({ 
      success: true, 
      processed: willsToMonitor?.length || 0,
      timestamp: new Date().toISOString()
    }), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Monitor subscriptions error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
