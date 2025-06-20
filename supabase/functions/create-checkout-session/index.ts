
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { plan, billingPeriod } = await req.json();

    // Hardcoded prices and product IDs
    const productMap = {
      'platinum': {
        'monthly': 'prod_S2537v7mpccHQI',
        'yearly': 'prod_S2537v7mpccHQI',
        'lifetime': 'prod_S2537v7mpccHQI',
      },
      'gold': {
        'monthly': 'prod_S252Aj8D5tFfXg',
        'yearly': 'prod_S252Aj8D5tFfXg',
        'lifetime': 'prod_S252Aj8D5tFfXg',
      },
      'starter': {
        'monthly': 'prod_S251guGbh50tje',
        'yearly': 'prod_S251guGbh50tje',
        'lifetime': 'prod_S251guGbh50tje',
      }
    };

    const productId = productMap[plan][billingPeriod];
    const product = await stripe.products.retrieve(productId);
    const prices = await stripe.prices.list({ product: productId, active: true });

    // Get the authenticated user
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

    // Find or create Stripe customer
    let customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      mode: billingPeriod === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${req.headers.get('origin')}/billing?success=true`,
      cancel_url: `${req.headers.get('origin')}/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: plan,
        billing_period: billingPeriod
      }
    });

    return new Response(JSON.stringify({ url: session.url }), { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
