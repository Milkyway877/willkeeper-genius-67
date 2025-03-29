
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

    const reqData = await req.json();
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
        const { data } = await supabaseClient.auth.getUser(token);
        
        if (data?.user) {
          customerEmail = data.user.email;
          userId = data.user.id;
          console.log(`Found authenticated user: ${customerEmail}`);
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    }

    // Look up existing customer or create a new one if email is available
    let customerId = undefined;
    if (customerEmail) {
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
    }

    // Define real Stripe product price IDs
    // These are placeholder IDs that should be replaced with your actual Stripe price IDs
    const PRICE_IDS = {
      starter: {
        monthly: "price_1SLzknHTKA0osvsHDZyNfQmV", 
        yearly: "price_1SLzlZHTKA0osvsHayvlZEQB",
        lifetime: "price_1SLzlyHTKA0osvsHWE6B6gTQ", 
      },
      gold: {
        monthly: "price_1SLzmRHTKA0osvsHlccYFqyn",
        yearly: "price_1SLzmtHTKA0osvsHo5NdQg9W",
        lifetime: "price_1SLznSHTKA0osvsHjU8w0fzK",
      },
      platinum: {
        monthly: "price_1SLzo3HTKA0osvsHVx1OLMsf",
        yearly: "price_1SLzoeHTKA0osvsHDLkQJzDh",
        lifetime: "price_1SLzp6HTKA0osvsH84fcdWAA",
      },
    };

    // Get the price ID for the chosen plan and billing period
    if (!PRICE_IDS[plan] || !PRICE_IDS[plan][billingPeriod]) {
      throw new Error(`Invalid plan (${plan}) or billing period (${billingPeriod})`);
    }
    
    const priceId = PRICE_IDS[plan][billingPeriod];
    console.log("Using price ID:", priceId);

    // Determine checkout mode based on billing period
    const checkoutMode = billingPeriod === "lifetime" ? "payment" : "subscription";

    // Create a checkout session
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
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
