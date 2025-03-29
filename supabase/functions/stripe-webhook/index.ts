
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    
    if (!stripeWebhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Set up Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the stripe signature from headers
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    // Get the raw body as text
    const rawBody = await req.text();

    // Construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed` }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log(`Received webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Extract metadata
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        const billingPeriod = session.metadata?.billing_period;
        
        if (!userId) {
          console.warn("No user_id found in session metadata");
          break;
        }

        // For one-time payments
        if (session.mode === "payment") {
          // Record the payment
          const { error: paymentError } = await supabaseAdmin
            .from("payments")
            .insert({
              user_id: userId,
              stripe_payment_id: session.payment_intent,
              amount: session.amount_total,
              currency: session.currency,
              status: "succeeded",
            });

          if (paymentError) {
            console.error("Error recording payment:", paymentError);
          }
          
          // If this is a lifetime subscription, create a subscription record with no end date
          if (billingPeriod === "lifetime") {
            const { error: subError } = await supabaseAdmin
              .from("subscriptions")
              .insert({
                user_id: userId,
                stripe_subscription_id: `lifetime_${session.id}`,
                stripe_price_id: session.line_items?.data[0]?.price?.id,
                status: "active",
                start_date: new Date().toISOString(),
              });

            if (subError) {
              console.error("Error recording lifetime subscription:", subError);
            }
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Get the customer ID
        const customerId = subscription.customer;
        
        // Find the user associated with this customer
        const { data: users, error: userError } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId);

        if (userError || !users || users.length === 0) {
          console.error("Error finding user for customer:", customerId, userError);
          break;
        }

        const userId = users[0].id;

        // Update or insert the subscription
        const { error: upsertError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price.id,
            status: subscription.status,
            start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          }, { onConflict: "stripe_subscription_id" });

        if (upsertError) {
          console.error("Error upserting subscription:", upsertError);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Update the subscription status to canceled
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          console.error("Error updating deleted subscription:", updateError);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        
        // If this is for a subscription, update the subscription end date
        if (invoice.subscription) {
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              end_date: new Date(invoice.lines.data[0]?.period.end * 1000).toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription);

          if (updateError) {
            console.error("Error updating subscription after payment:", updateError);
          }
        }

        // Record the payment
        const { data: subscriptions, error: subError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", invoice.subscription)
          .limit(1);

        if (!subError && subscriptions && subscriptions.length > 0) {
          const { error: paymentError } = await supabaseAdmin
            .from("payments")
            .insert({
              user_id: subscriptions[0].user_id,
              stripe_payment_id: invoice.payment_intent,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: "succeeded",
            });

          if (paymentError) {
            console.error("Error recording payment:", paymentError);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        
        // Update the subscription status
        if (invoice.subscription) {
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);

          if (updateError) {
            console.error("Error updating subscription after failed payment:", updateError);
          }
        }

        // Record the payment failure
        const { data: subscriptions, error: subError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", invoice.subscription)
          .limit(1);

        if (!subError && subscriptions && subscriptions.length > 0) {
          const { error: paymentError } = await supabaseAdmin
            .from("payments")
            .insert({
              user_id: subscriptions[0].user_id,
              stripe_payment_id: invoice.payment_intent,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: "failed",
            });

          if (paymentError) {
            console.error("Error recording failed payment:", paymentError);
          }
        }
        break;
      }
    }

    // Return a success response
    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in stripe-webhook function:", error);
    
    // Always return a 200 response to Stripe even on errors
    // This prevents Stripe from retrying the webhook unnecessarily
    return new Response(
      JSON.stringify({ received: true, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  }
});
