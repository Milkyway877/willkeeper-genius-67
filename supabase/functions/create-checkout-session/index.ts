
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORS headers for cross-origin requests
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

  // Set up Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get authentication token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Authenticated user not found: ' + (userError?.message || ''));
    }

    console.log("Found authenticated user:", user.email);

    // Parse request body
    const { plan, billingPeriod } = await req.json();
    
    if (!plan || !billingPeriod) {
      throw new Error('Both plan and billingPeriod are required');
    }
    
    console.log("Received request for plan:", plan, "billing period:", billingPeriod);

    // Get or create Stripe customer
    let customerId;
    
    // First, check if user already has a Stripe customer ID
    const { data: userData, error: profileError } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (userData?.stripe_customer_id) {
      customerId = userData.stripe_customer_id;
      console.log("Found existing Stripe customer:", customerId);
    } else {
      // Create a new customer in Stripe by calling our create-stripe-customer function
      console.log("No Stripe customer ID found, creating new customer");
      
      const { data: customerData, error: customerError } = await supabase.functions.invoke("create-stripe-customer", { 
        body: { 
          user_id: user.id, 
          email: user.email, 
          name: user.user_metadata?.full_name 
        }
      });
      
      if (customerError || !customerData?.customer_id) {
        console.error("Error creating Stripe customer:", customerError || "No customer ID returned");
        throw new Error("Failed to create Stripe customer");
      }
      
      customerId = customerData.customer_id;
      console.log("Created new Stripe customer:", customerId);
    }

    // Using hardcoded price IDs that MUST match what's in your Stripe dashboard
    // These are dummy IDs - you need to replace these with your actual Stripe price IDs
    const priceMap = {
      starter: {
        monthly: "price_1Pw5n4HTKA0osvsHkCuFgfXL",  // Replace with your actual price ID
        yearly: "price_1Pw5n4HTKA0osvsHfzP7EY2T",   // Replace with your actual price ID
        lifetime: "price_1Pw5n4HTKA0osvsHA4IXOBUq"  // Replace with your actual price ID
      },
      gold: {
        monthly: "price_1Pw5mmHTKA0osvsHXJmFhUTw",  // Replace with your actual price ID
        yearly: "price_1Pw5mmHTKA0osvsHe91cWzfE",   // Replace with your actual price ID
        lifetime: "price_1Pw5mmHTKA0osvsHq0xmJPrE"  // Replace with your actual price ID
      },
      platinum: {
        monthly: "price_1Pw5m7HTKA0osvsHvhUxabnP",  // Replace with your actual price ID
        yearly: "price_1Pw5m7HTKA0osvsHKAYNu1Bb",   // Replace with your actual price ID
        lifetime: "price_1Pw5m7HTKA0osvsHYALjnZLQ"  // Replace with your actual price ID
      }
    };
    
    // Get price ID based on plan and billing period
    const priceId = priceMap[plan]?.[billingPeriod];
    
    if (!priceId) {
      throw new Error(`No price configured for ${plan} with ${billingPeriod} billing period`);
    }
    
    console.log(`Using price ID for checkout: ${priceId}`);

    // Configure checkout session
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: billingPeriod === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${req.headers.get('origin')}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan,
        billing_period: billingPeriod
      }
    };
    
    console.log("Creating checkout session with config:", JSON.stringify(sessionConfig));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log("Checkout session created successfully with ID:", session.id);

    // Return the checkout URL to redirect the user to Stripe
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: corsHeaders,
        status: 200
      }
    );
  } catch (error) {
    console.error("Stripe error creating session:", error);
    
    // Return a friendly error message
    return new Response(
      JSON.stringify({ 
        error: error.message || "There was an error processing your payment request. Please try again later." 
      }),
      {
        headers: corsHeaders,
        status: 400
      }
    );
  }
});
