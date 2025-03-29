
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Stripe with API key from environment variable
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Parse request data
    let reqData;
    try {
      reqData = await req.json();
    } catch (e) {
      console.error("Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const { plan, billingPeriod } = reqData;
    
    if (!plan || !billingPeriod) {
      console.error("Missing required parameters:", { plan, billingPeriod });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Received request for plan:", plan, "billing period:", billingPeriod);

    // Get user information if available
    let customerEmail = null;
    let userId = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase environment variables");
        return new Response(
          JSON.stringify({ error: "Server configuration error" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
      
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        
        if (user) {
          customerEmail = user.email;
          userId = user.id;
          console.log(`Found authenticated user: ${customerEmail}`);
        }
      } catch (error) {
        console.error("Error getting user data:", error);
        // Continue without customer info but don't fail
      }
    }

    // Look up existing customer or create a new one if email is available
    let customerId;
    if (customerEmail) {
      try {
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1
        });

        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          console.log(`Found existing Stripe customer: ${customerId}`);
        } else {
          const newCustomer = await stripe.customers.create({
            email: customerEmail,
            metadata: {
              user_id: userId
            }
          });
          customerId = newCustomer.id;
          console.log(`Created new Stripe customer: ${customerId}`);
        }
      } catch (error) {
        console.error("Error handling Stripe customer:", error);
        // Continue without customer ID but don't fail
      }
    }

    // Define Stripe product price IDs with fixed values
    // The fallback values are just examples and will be replaced by real values
    const PRICE_IDS = {
      starter: {
        monthly: Deno.env.get("STRIPE_PRICE_STARTER_MONTHLY") || "price_example_starter_monthly",
        yearly: Deno.env.get("STRIPE_PRICE_STARTER_YEARLY") || "price_example_starter_yearly",
        lifetime: Deno.env.get("STRIPE_PRICE_STARTER_LIFETIME") || "price_example_starter_lifetime",
      },
      gold: {
        monthly: Deno.env.get("STRIPE_PRICE_GOLD_MONTHLY") || "price_example_gold_monthly",
        yearly: Deno.env.get("STRIPE_PRICE_GOLD_YEARLY") || "price_example_gold_yearly",
        lifetime: Deno.env.get("STRIPE_PRICE_GOLD_LIFETIME") || "price_example_gold_lifetime",
      },
      platinum: {
        monthly: Deno.env.get("STRIPE_PRICE_PLATINUM_MONTHLY") || "price_example_platinum_monthly",
        yearly: Deno.env.get("STRIPE_PRICE_PLATINUM_YEARLY") || "price_example_platinum_yearly",
        lifetime: Deno.env.get("STRIPE_PRICE_PLATINUM_LIFETIME") || "price_example_platinum_lifetime",
      },
    };

    // Validate plan and billing period
    if (!PRICE_IDS[plan] || !PRICE_IDS[plan][billingPeriod]) {
      return new Response(
        JSON.stringify({ error: `Invalid plan (${plan}) or billing period (${billingPeriod})` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const priceId = PRICE_IDS[plan][billingPeriod];
    console.log("Using price ID:", priceId);

    // Determine checkout mode based on billing period
    const checkoutMode = billingPeriod === "lifetime" ? "payment" : "subscription";

    // Create checkout session
    try {
      const origin = req.headers.get("origin") || "https://willtank.com";
      
      const sessionConfig = {
        customer: customerId,
        customer_email: !customerId ? customerEmail : undefined,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: checkoutMode,
        success_url: `${origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/billing?canceled=true`,
        metadata: {
          user_id: userId,
          plan: plan,
          billing_period: billingPeriod
        }
      };

      console.log("Creating checkout session with config:", JSON.stringify(sessionConfig));
      const session = await stripe.checkout.sessions.create(sessionConfig);

      console.log("Checkout session created:", session.id);
      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error("Stripe error creating session:", stripeError);
      return new Response(
        JSON.stringify({ 
          error: stripeError.message || "Error creating checkout session",
          details: stripeError
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
