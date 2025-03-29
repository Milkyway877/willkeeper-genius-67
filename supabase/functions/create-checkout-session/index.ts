
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
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (userData?.stripe_customer_id) {
      customerId = userData.stripe_customer_id;
      console.log("Found existing Stripe customer:", customerId);
    } else {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name,
        metadata: {
          supabaseUserId: user.id
        }
      });
      
      customerId = customer.id;
      
      // Save the customer ID to the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      
      if (updateError) {
        console.error("Error saving Stripe customer ID:", updateError);
      }
    }

    // Lookup the appropriate price ID based on plan and billing period
    // In a production environment, these would be stored in a database or configuration
    // For now, we'll use a mapping function
    let priceId;
    
    // Define price lookup based on plan and billing period
    const priceMap = {
      starter: {
        monthly: "price_starter_monthly", 
        yearly: "price_starter_yearly",
        lifetime: "price_starter_lifetime"
      },
      gold: {
        monthly: "price_gold_monthly",
        yearly: "price_gold_yearly",
        lifetime: "price_gold_lifetime"
      },
      platinum: {
        monthly: "price_platinum_monthly",
        yearly: "price_platinum_yearly",
        lifetime: "price_platinum_lifetime"
      }
    };
    
    // Look up products for the specified plan
    console.log("Looking up products for", plan, "plan...");
    const products = await stripe.products.list({
      active: true
    });
    
    console.log(`Found ${products.data.length} active products`);
    
    // Find the product that matches our plan
    const matchingProduct = products.data.find(product => 
      product.name.toUpperCase().includes(plan.toUpperCase())
    );
    
    if (!matchingProduct) {
      throw new Error(`No product found for plan: ${plan}`);
    }
    
    console.log(`Found matching product: ${matchingProduct.id} (${matchingProduct.name})`);
    
    // Get the prices for this product
    const prices = await stripe.prices.list({
      product: matchingProduct.id,
      active: true
    });
    
    console.log(`Found ${prices.data.length} active prices for product`);
    
    // Find a price that matches the billing period
    const matchingPrice = prices.data.find(price => {
      if (billingPeriod === 'lifetime') {
        return price.type === 'one_time';
      } else {
        return price.type === 'recurring' && 
          price.recurring?.interval === (billingPeriod === 'monthly' ? 'month' : 'year');
      }
    });
    
    if (!matchingPrice) {
      console.error(`No price found for plan: ${plan} with billing period: ${billingPeriod}`);
      throw new Error(`No price configuration found for ${plan} with ${billingPeriod} billing. Please configure this in your Stripe dashboard.`);
    }
    
    priceId = matchingPrice.id;
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
        error: "There was an error processing your payment request. Please try again later." 
      }),
      {
        headers: corsHeaders,
        status: 400
      }
    );
  }
});
