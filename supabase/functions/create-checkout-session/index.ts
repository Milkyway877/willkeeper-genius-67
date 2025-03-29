
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
    
    // Get real price IDs - for now using test IDs
    // In production these should be fetched from a database or environment variables
    const getPriceId = (selectedPlan, selectedBillingPeriod) => {
      // You can replace these with your actual Stripe price IDs
      const prices = {
        starter: {
          monthly: 'price_1OtWZiLtKc3zFCqcMepYlKcI',
          annual: 'price_1OtWbOLtKc3zFCqcH4BEimLG'
        },
        gold: {
          monthly: 'price_1OtWbzLtKc3zFCqclK3kGOZd',
          annual: 'price_1OtWceLtKc3zFCqcQROONBEQ'
        },
        platinum: {
          monthly: 'price_1OtWd9LtKc3zFCqcK5oqQdDp',
          annual: 'price_1OtWdbLtKc3zFCqc2EgSttjz'
        }
      };
      
      return prices[selectedPlan]?.[selectedBillingPeriod] || null;
    };
    
    const priceId = getPriceId(plan, billingPeriod);
    
    if (!priceId) {
      throw new Error(`Invalid plan or billing period: ${plan}, ${billingPeriod}`);
    }
    
    console.log(`Using price ID for checkout: ${priceId}`);
    
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
