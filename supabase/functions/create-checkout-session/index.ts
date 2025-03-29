
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
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request data
    const requestData = await req.json();
    const { plan, billingPeriod } = requestData;
    
    console.log(`Received request for plan: ${plan} billing period: ${billingPeriod}`);
    
    // Validate request data
    if (!plan || !billingPeriod) {
      throw new Error('Missing required parameters: plan and billingPeriod are required');
    }
    
    // Get the current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('User not found. Please ensure you\'re logged in.');
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
    
    // Check if customer already exists
    let customer;
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
      console.log(`Found existing Stripe customer: ${customer.id}`);
    } else {
      // Create a new customer
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      console.log(`Created new Stripe customer: ${customer.id}`);
    }
    
    // Determine price ID based on plan and billing period
    // NOTE: Replace these with actual Stripe price IDs in production
    const priceMap = {
      starter: {
        monthly: 'price_example_starter_monthly',
        annual: 'price_example_starter_annual'
      },
      professional: {
        monthly: 'price_example_professional_monthly',
        annual: 'price_example_professional_annual'
      },
      enterprise: {
        monthly: 'price_example_enterprise_monthly',
        annual: 'price_example_enterprise_annual'
      }
    };
    
    const priceId = priceMap[plan]?.[billingPeriod];
    if (!priceId) {
      throw new Error(`Invalid plan or billing period: ${plan}, ${billingPeriod}`);
    }
    
    console.log(`Using price ID: ${priceId}`);
    
    // Create checkout session configuration
    const sessionConfig = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan,
        billing_period: billingPeriod
      }
    };
    
    console.log(`Creating checkout session with config:`, JSON.stringify(sessionConfig));
    
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
