
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Consider restricting this to your actual domain in production
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
  
  // Initialize Stripe with secret key
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: "Stripe secret key not configured" }),
      { status: 500, headers: corsHeaders }
    );
  }
  
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });
  
  try {
    // Parse request body
    const { plan, billingPeriod } = await req.json();
    
    if (!plan || !billingPeriod) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: plan and billingPeriod" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log(`Received request for plan: ${plan} billing period: ${billingPeriod}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication error" }),
        { status: 401, headers: corsHeaders }
      );
    }
    
    console.log(`Found authenticated user: ${user.email}`);
    
    // Check if user already has a Stripe customer ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    let stripeCustomerId = userProfile?.stripe_customer_id;
    
    // If no customer ID exists, create one
    if (!stripeCustomerId) {
      console.log("No Stripe customer ID found, creating new customer");
      
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user profile with Stripe customer ID
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Error updating user with Stripe customer ID:", updateError);
        // Continue anyway as we have the customer ID
      }
    } else {
      console.log(`Found existing Stripe customer: ${stripeCustomerId}`);
    }
    
    // Map product names to their IDs
    const productMap = {
      'starter': {
        'monthly': 'prod_S24mg95AMIms1O',
        'yearly': 'prod_S24nzeS5Bi8BLr',
        'lifetime': 'prod_S251guGbh50tje'
      },
      'gold': {
        'monthly': 'prod_S24rv3q2Fscixp',
        'yearly': 'prod_S24sJE25TZiWmp',
        'lifetime': 'prod_S252Aj8D5tFfXg'
      },
      'platinum': {
        'monthly': 'prod_S24uIjzixtsIhy',
        'yearly': 'prod_S24vvPrNB1N2Rs',
        'lifetime': 'prod_S2537v7mpccHQI'
      }
    };
    
    // Get the product ID based on plan and billing period
    const productId = productMap[plan]?.[billingPeriod];
    
    if (!productId) {
      throw new Error(`Invalid plan (${plan}) or billing period (${billingPeriod}) combination`);
    }
    
    console.log(`Looking up products for ${plan} plan...`);
    
    // Get the product to find its prices
    const product = await stripe.products.retrieve(productId);
    console.log(`Found matching product: ${product.id} (${product.name})`);
    
    // Get all active prices for this product
    const pricesResult = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    
    const prices = pricesResult.data;
    console.log(`Found ${prices.length} active prices for product`);
    
    if (prices.length === 0) {
      throw new Error(`No prices found for product: ${product.id}`);
    }
    
    // Determine checkout mode based on billing period
    const mode = billingPeriod === 'lifetime' ? 'payment' : 'subscription';
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: prices[0].id,
          quantity: 1,
        },
      ],
      mode: mode,
      metadata: {
        user_id: user.id,
        plan: plan,
        billing_period: billingPeriod,
      },
      success_url: `${req.headers.get('origin')}/dashboard?checkout=success`,
      cancel_url: `${req.headers.get('origin')}/pricing?checkout=canceled`,
    });
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Stripe error creating session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders }
    );
  }
});
