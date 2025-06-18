
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

  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY not found');
    return new Response(JSON.stringify({ error: 'Stripe configuration error' }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  try {
    const { plan, billingPeriod, return_url } = await req.json();

    console.log('Creating checkout session for:', { plan, billingPeriod });

    // Validate input
    if (!plan || !billingPeriod) {
      return new Response(JSON.stringify({ error: 'Missing plan or billing period' }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Updated price mapping - replace these with your actual Stripe price IDs
    const priceMap = {
      'starter': {
        'monthly': 'price_starter_monthly_id',    // Replace with actual price ID
        'yearly': 'price_starter_yearly_id',      // Replace with actual price ID
        'lifetime': 'price_starter_lifetime_id'   // Replace with actual price ID
      },
      'gold': {
        'monthly': 'price_gold_monthly_id',       // Replace with actual price ID
        'yearly': 'price_gold_yearly_id',         // Replace with actual price ID
        'lifetime': 'price_gold_lifetime_id'      // Replace with actual price ID
      },
      'platinum': {
        'monthly': 'price_platinum_monthly_id',   // Replace with actual price ID
        'yearly': 'price_platinum_yearly_id',     // Replace with actual price ID
        'lifetime': 'price_platinum_lifetime_id'  // Replace with actual price ID
      }
    };

    const priceId = priceMap[plan]?.[billingPeriod];
    
    if (!priceId) {
      console.error('Invalid plan or billing period:', { plan, billingPeriod });
      return new Response(JSON.stringify({ error: 'Invalid plan or billing period' }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Using price ID:', priceId);

    // Verify the price exists in Stripe
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log('Price verified:', { id: price.id, amount: price.unit_amount });
    } catch (priceError) {
      console.error('Price not found in Stripe:', priceId, priceError);
      return new Response(JSON.stringify({ error: 'Price configuration error' }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }

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
      console.error('Authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    console.log('User authenticated:', user.email);

    // Find or create Stripe customer
    let customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Existing customer found:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      console.log('New customer created:', customerId);
    }

    // Determine the checkout mode
    const mode = billingPeriod === 'lifetime' ? 'payment' : 'subscription';

    const sessionConfig = {
      customer: customerId,
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      mode: mode,
      success_url: return_url || `${req.headers.get('origin')}/billing?success=true`,
      cancel_url: `${req.headers.get('origin')}/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: plan,
        billing_period: billingPeriod
      }
    };

    console.log('Creating session with config:', sessionConfig);

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created successfully:', session.id);

    return new Response(JSON.stringify({ url: session.url }), { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.stack 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
