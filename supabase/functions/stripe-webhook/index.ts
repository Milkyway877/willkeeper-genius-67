
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

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  // Get the signature from the headers
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature provided" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get the raw body
  const body = await req.text();
  
  // Create Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_ANON_KEY") || ""
  );

  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Extract customer info
        const customerId = session.customer;
        const customerEmail = session.customer_details?.email;
        
        if (!customerId || !customerEmail) {
          throw new Error('Missing customer information');
        }
        
        // Get subscription ID if it's a subscription
        const subscriptionId = session.subscription;
        
        if (subscriptionId) {
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Extract subscription data
          const planId = subscription.items.data[0].price.id;
          const startDate = new Date(subscription.current_period_start * 1000);
          const endDate = new Date(subscription.current_period_end * 1000);
          
          // Determine plan from price ID
          let plan = 'starter';
          if (planId.includes('gold')) {
            plan = 'gold';
          } else if (planId.includes('platinum')) {
            plan = 'platinum';
          }
          
          // Find user by email
          const { data: userData, error: userError } = await supabaseClient
            .from('user_profiles')
            .select('id')
            .eq('email', customerEmail)
            .single();
            
          if (userError && userError.code !== 'PGRST116') {
            throw userError;
          }
          
          const userId = userData?.id;
          
          if (userId) {
            // Create or update subscription in database
            await supabaseClient
              .from('subscriptions')
              .upsert({
                user_id: userId,
                plan: plan,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                status: 'Active'
              }, {
                onConflict: 'user_id'
              });
          }
        } else {
          // Handle one-time payments (lifetime plans)
          // Similar logic to above but with different dates
        }
        break;
        
      case 'invoice.payment_succeeded':
        // Handle subscription renewals
        const invoice = event.data.object;
        const subscriptionId2 = invoice.subscription;
        
        if (subscriptionId2) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId2);
          // Update subscription end date in database
          // Similar to above
        }
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellations
        const canceledSubscription = event.data.object;
        const customerId2 = canceledSubscription.customer;
        
        // Find user by Stripe customer ID
        // Update subscription status to 'Canceled' in database
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
