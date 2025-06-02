
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscription_tier: null, 
        subscription_end: null,
        is_trial: false,
        trial_end: null,
        trial_days_remaining: 0
      }), { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      // Check for trialing subscriptions
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'trialing',
        limit: 1
      });

      if (trialingSubscriptions.data.length === 0) {
        return new Response(JSON.stringify({ 
          subscribed: false, 
          subscription_tier: null, 
          subscription_end: null,
          is_trial: false,
          trial_end: null,
          trial_days_remaining: 0
        }), { 
          status: 200, 
          headers: corsHeaders 
        });
      }
    }

    const subscription = subscriptions.data[0] || (await stripe.subscriptions.list({
      customer: customerId,
      status: 'trialing',
      limit: 1
    })).data[0];

    const price = subscription.items.data[0].price;
    const product = await stripe.products.retrieve(price.product);

    let subscriptionTier;
    const amount = price.unit_amount || 0;
    if (amount <= 1499) subscriptionTier = 'Starter';
    else if (amount <= 2900) subscriptionTier = 'Gold';
    else subscriptionTier = 'Platinum';

    const isInTrial = subscription.status === 'trialing';
    const trialEnd = isInTrial ? new Date(subscription.trial_end * 1000) : null;
    const trialDaysRemaining = isInTrial ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

    // Update subscription in database
    await supabaseClient.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: price.id,
      status: subscription.status,
      plan: subscriptionTier.toLowerCase(),
      is_trial: isInTrial,
      trial_start_date: isInTrial ? new Date(subscription.created * 1000).toISOString() : null,
      trial_end_date: trialEnd?.toISOString() || null,
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

    return new Response(JSON.stringify({ 
      subscribed: true, 
      subscription_tier: subscriptionTier, 
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      is_trial: isInTrial,
      trial_end: trialEnd?.toISOString() || null,
      trial_days_remaining: trialDaysRemaining
    }), { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
