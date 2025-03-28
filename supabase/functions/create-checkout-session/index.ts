
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
        // Continue without user data
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

    // Define price IDs based on plan and billing period
    // These should be actual Stripe price IDs created in your Stripe dashboard
    const PRICE_IDS = {
      starter: {
        monthly: "price_1OvCsRCMnxJqGjRjpRhE4k4X", // Replace with actual Stripe price IDs
        yearly: "price_1OvCt2CMnxJqGjRjMnJFJHLb",
        lifetime: "price_1OvCtnCMnxJqGjRjqr8EXwbK", 
      },
      gold: {
        monthly: "price_1OvCuKCMnxJqGjRj6lUYVblJ",
        yearly: "price_1OvCuKCMnxJqGjRj5z1TuuYJ",
        lifetime: "price_1OvCuKCMnxJqGjRjeXSk52SE",
      },
      platinum: {
        monthly: "price_1OvCv3CMnxJqGjRjPOz1E2Po",
        yearly: "price_1OvCv3CMnxJqGjRjYBJPVuqL",
        lifetime: "price_1OvCv3CMnxJqGjRjuOm4QGHP",
      },
    };

    // Get the price ID for the chosen plan and billing period
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
