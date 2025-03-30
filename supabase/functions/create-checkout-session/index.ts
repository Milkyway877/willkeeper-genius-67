
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
      // Create a new customer in Stripe
      console.log("No Stripe customer ID found, creating new customer");
      
      try {
        // Create customer directly in this function
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          metadata: {
            supabase_uid: user.id
          }
        });
        
        customerId = customer.id;
        console.log("Created new Stripe customer:", customerId);
        
        // Store the customer ID in user_profiles
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", user.id);
          
        if (updateError) {
          console.error("Error saving Stripe customer ID:", updateError);
          // Continue anyway as we have the customer ID now
        }
      } catch (error) {
        console.error("Error creating Stripe customer:", error);
        throw new Error("Failed to create Stripe customer");
      }
    }

    // Mapping product IDs to their corresponding price IDs
    // These are the product IDs provided by you
    const productMap = {
      starter: {
        monthly: "prod_S24mg95AMIms1O",  // STARTER MONTHLY
        yearly: "prod_S24nzeS5Bi8BLr",   // STARTER YEARLY
        lifetime: "prod_S251guGbh50tje"  // STARTER LIFETIME
      },
      gold: {
        monthly: "prod_S24rv3q2Fscixp",  // GOLD MONTHLY
        yearly: "prod_S24sJE25TZiWmp",   // GOLD YEARLY
        lifetime: "prod_S252Aj8D5tFfXg"  // GOLD LIFETIME
      },
      platinum: {
        monthly: "prod_S24uIjzixtsIhy",  // PLATINUM MONTHLY
        yearly: "prod_S24vvPrNB1N2Rs",   // PLATINUM YEARLY
        lifetime: "prod_S2537v7mpccHQI"  // PLATINUM LIFETIME
      }
    };
    
    // Get product ID based on plan and billing period
    const productId = productMap[plan]?.[billingPeriod];
    
    if (!productId) {
      throw new Error(`No product configured for ${plan} with ${billingPeriod} billing period`);
    }
    
    console.log(`Using product ID for checkout: ${productId}`);
    
    // Get the price ID for the selected product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1
    });
    
    if (prices.data.length === 0) {
      console.error(`No price found for product: ${productId}`);
      throw new Error(`No price found for plan: ${plan} with billing period: ${billingPeriod}`);
    }
    
    const priceId = prices.data[0].id;
    console.log(`Found price ID for checkout: ${priceId}`);

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
        error: error.message || "There was an error processing your payment request. Please try again later.",
        status: 'error'
      }),
      {
        headers: corsHeaders,
        status: 400
      }
    );
  }
});
