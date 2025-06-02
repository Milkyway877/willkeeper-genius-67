
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
  // Handle CORS preflight requests
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
        subscription_end: null 
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
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscription_tier: null, 
        subscription_end: null 
      }), { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    const subscription = subscriptions.data[0];
    const price = subscription.items.data[0].price;
    const product = await stripe.products.retrieve(price.product);

    let subscriptionTier;
    if (product.id === 'prod_S2537v7mpccHQI') subscriptionTier = 'Platinum';
    else if (product.id === 'prod_S252Aj8D5tFfXg') subscriptionTier = 'Gold';
    else if (product.id === 'prod_S251guGbh50tje') subscriptionTier = 'Starter';
    else subscriptionTier = 'Unknown';

    return new Response(JSON.stringify({ 
      subscribed: true, 
      subscription_tier: subscriptionTier, 
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString() 
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
