
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@12.9.0';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Get the Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.1.0');
    
    // Create a Supabase client with proper environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request data
    const requestData = await req.json();
    const { plan, billingPeriod } = requestData;
    
    console.log(`Received request for plan: ${plan} billing period: ${billingPeriod}`);
    
    // Validate request data
    if (!plan || !billingPeriod) {
      throw new Error('Missing required parameters: plan and billingPeriod are required');
    }
    
    // Get the current user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('User not found or authentication failed');
    }
    
    console.log(`Found authenticated user: ${user.email}`);
    
    // Initialize Stripe with the key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    
    // Check if customer already exists in Stripe
    let customer;
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
      console.log(`Found existing Stripe customer: ${customer.id}`);
    } else {
      // Create a new customer in Stripe
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      console.log(`Created new Stripe customer: ${customer.id}`);
    }
    
    // Lookup actual Stripe products and prices
    console.log(`Looking up products for ${plan} plan...`);
    const products = await stripe.products.list({
      active: true,
      limit: 100
    });
    
    console.log(`Found ${products.data.length} active products`);
    
    // Find matching product by name or metadata
    const matchProduct = products.data.find(product => {
      // Match by either name (case insensitive) or metadata
      const nameMatch = product.name.toLowerCase().includes(plan.toLowerCase());
      const metadataMatch = product.metadata?.plan?.toLowerCase() === plan.toLowerCase();
      return nameMatch || metadataMatch;
    });
    
    if (!matchProduct) {
      console.error(`No product found matching plan: ${plan}`);
      throw new Error(`No product found for plan: ${plan}. Please create this product in your Stripe dashboard.`);
    }
    
    console.log(`Found matching product: ${matchProduct.id} (${matchProduct.name})`);
    
    // Get all prices for the product
    const prices = await stripe.prices.list({
      product: matchProduct.id,
      active: true
    });
    
    console.log(`Found ${prices.data.length} active prices for product`);
    
    // Match price by billing period
    const periodMapping = {
      'monthly': 'month',
      'yearly': 'year',
      'lifetime': null // For one-time payments
    };
    
    let matchPrice;
    
    if (billingPeriod === 'lifetime') {
      // For lifetime, find a one-time payment price
      matchPrice = prices.data.find(price => price.type === 'one_time');
    } else {
      // For subscription plans, match by interval
      const interval = periodMapping[billingPeriod];
      matchPrice = prices.data.find(price => 
        price.type === 'recurring' && 
        price.recurring?.interval === interval
      );
    }
    
    if (!matchPrice) {
      console.error(`No price found for plan: ${plan} with billing period: ${billingPeriod}`);
      throw new Error(`No price configuration found for ${plan} with ${billingPeriod} billing. Please configure this in your Stripe dashboard.`);
    }
    
    console.log(`Using price ID for checkout: ${matchPrice.id}`);
    
    // Determine checkout mode based on price type
    const mode = matchPrice.type === 'recurring' ? 'subscription' : 'payment';
    console.log(`Checkout mode: ${mode}`);
    
    // Create checkout session configuration
    const sessionConfig = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: matchPrice.id,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${req.headers.get('origin') || 'http://localhost:5173'}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:5173'}/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan,
        billing_period: billingPeriod
      }
    };
    
    console.log('Creating checkout session with config:', JSON.stringify(sessionConfig));
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('Checkout session created successfully:', session.id);
    
    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Stripe error creating session:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create checkout session'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
