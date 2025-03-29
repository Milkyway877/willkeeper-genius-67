
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

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

    console.log("Received request for plan:", plan, "billing period:", billingPeriod);

    // Get user information if available
    let customerEmail = null;
    let userId = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_ANON_KEY") || ""
      );
      
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
      }
    }

    // Look up existing customer or create a new one if email is available
    let customerId = undefined;
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
        // Continue without customer ID
      }
    }

    // Define real Stripe product price IDs
    const PRICE_IDS = {
      starter: {
        monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || "price_1SLzknHTKA0osvsHDZyNfQmV",
        yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || "price_1SLzlZHTKA0osvsHayvlZEQB",
        lifetime: process.env.STRIPE_PRICE_STARTER_LIFETIME || "price_1SLzlyHTKA0osvsHWE6B6gTQ", 
      },
      gold: {
        monthly: process.env.STRIPE_PRICE_GOLD_MONTHLY || "price_1SLzmRHTKA0osvsHlccYFqyn",
        yearly: process.env.STRIPE_PRICE_GOLD_YEARLY || "price_1SLzmtHTKA0osvsHo5NdQg9W",
        lifetime: process.env.STRIPE_PRICE_GOLD_LIFETIME || "price_1SLznSHTKA0osvsHjU8w0fzK",
      },
      platinum: {
        monthly: process.env.STRIPE_PRICE_PLATINUM_MONTHLY || "price_1SLzo3HTKA0osvsHVx1OLMsf",
        yearly: process.env.STRIPE_PRICE_PLATINUM_YEARLY || "price_1SLzoeHTKA0osvsHDLkQJzDh",
        lifetime: process.env.STRIPE_PRICE_PLATINUM_LIFETIME || "price_1SLzp6HTKA0osvsH84fcdWAA",
      },
    };

    // Get the price ID for the chosen plan and billing period
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
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: !customerId ? customerEmail : undefined, // Only set if we don't have a customer ID
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: checkoutMode,
        success_url: `${req.headers.get("origin")}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/billing?canceled=true`,
        metadata: {
          user_id: userId,
          plan: plan,
          billing_period: billingPeriod
        }
      });

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
        JSON.stringify({ error: stripeError.message || "Error creating checkout session" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
