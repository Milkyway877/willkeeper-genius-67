
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0";

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

    // Define price IDs based on plan and billing period
    const priceIDs = {
      starter: {
        monthly: "price_starter_monthly", // Replace with actual Stripe price IDs
        yearly: "price_starter_yearly",
        lifetime: "price_starter_lifetime",
      },
      gold: {
        monthly: "price_gold_monthly",
        yearly: "price_gold_yearly",
        lifetime: "price_gold_lifetime",
      },
      platinum: {
        monthly: "price_platinum_monthly",
        yearly: "price_platinum_yearly",
        lifetime: "price_platinum_lifetime",
      },
    };

    // Get the price ID for the chosen plan and billing period
    const priceId = priceIDs[plan][billingPeriod];
    console.log("Using price ID:", priceId);

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // Replace with actual price ID once created in Stripe
          quantity: 1,
        },
      ],
      mode: billingPeriod === "lifetime" ? "payment" : "subscription",
      success_url: `${req.headers.get("origin")}/billing?success=true`,
      cancel_url: `${req.headers.get("origin")}/billing?canceled=true`,
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
