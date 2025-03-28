
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

    console.log("Received Stripe event:", event.type);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log("Processing checkout.session.completed:", session.id);
        
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
          const priceId = subscription.items.data[0].price.id;
          const startDate = new Date(subscription.current_period_start * 1000);
          const endDate = new Date(subscription.current_period_end * 1000);
          
          // Get the product details to determine the plan
          const productId = subscription.items.data[0].price.product;
          const product = await stripe.products.retrieve(productId.toString());
          
          // Determine plan from product metadata or name
          let plan = 'starter';
          if (product.name.toLowerCase().includes('gold') || priceId.toLowerCase().includes('gold')) {
            plan = 'gold';
          } else if (product.name.toLowerCase().includes('platinum') || priceId.toLowerCase().includes('platinum')) {
            plan = 'platinum';
          }
          
          console.log(`Identified plan: ${plan} for customer: ${customerEmail}`);
          
          // Find user by email
          const { data: userData, error: userError } = await supabaseClient
            .from('user_profiles')
            .select('id')
            .eq('email', customerEmail)
            .single();
            
          if (userError) {
            console.error("Error finding user:", userError);
            if (userError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
              throw userError;
            }
          }
          
          const userId = userData?.id;
          
          if (userId) {
            console.log(`Found user with ID: ${userId}`);
            // Create or update subscription in database
            const { error: subscriptionError } = await supabaseClient
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan: plan,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              });
              
            if (subscriptionError) {
              console.error("Error updating subscription:", subscriptionError);
              throw subscriptionError;
            }
            
            console.log(`Successfully updated subscription for user: ${userId}`);
          } else {
            console.error(`User not found for email: ${customerEmail}`);
          }
        } else if (session.mode === 'payment') {
          // Handle one-time payments (lifetime plans)
          console.log("Processing one-time payment");
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          const priceId = lineItems.data[0]?.price?.id;
          
          // Get the product details
          if (priceId) {
            const price = await stripe.prices.retrieve(priceId);
            const productId = price.product;
            const product = await stripe.products.retrieve(productId.toString());
            
            // Determine plan from product metadata or name
            let plan = 'starter';
            if (product.name.toLowerCase().includes('gold') || priceId.toLowerCase().includes('gold')) {
              plan = 'gold';
            } else if (product.name.toLowerCase().includes('platinum') || priceId.toLowerCase().includes('platinum')) {
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
              // Create or update subscription with a far future end date for lifetime plans
              const farFuture = new Date();
              farFuture.setFullYear(farFuture.getFullYear() + 100); // 100 years from now
              
              await supabaseClient
                .from('subscriptions')
                .upsert({
                  user_id: userId,
                  stripe_customer_id: customerId,
                  plan: plan,
                  start_date: new Date().toISOString(),
                  end_date: farFuture.toISOString(),
                  status: 'active',
                  is_lifetime: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });
            }
          }
        }
        break;
        
      case 'invoice.payment_succeeded':
        // Handle subscription renewals
        console.log("Processing invoice.payment_succeeded");
        const invoice = event.data.object;
        const subscriptionId2 = invoice.subscription;
        
        if (subscriptionId2) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId2);
          const endDate = new Date(subscription.current_period_end * 1000);
          
          // Update subscription end date in database
          const { data: subscriptionData, error: findError } = await supabaseClient
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId2)
            .single();
            
          if (findError && findError.code !== 'PGRST116') {
            throw findError;
          }
          
          if (subscriptionData?.user_id) {
            await supabaseClient
              .from('subscriptions')
              .update({
                end_date: endDate.toISOString(),
                updated_at: new Date().toISOString(),
                status: 'active'
              })
              .eq('user_id', subscriptionData.user_id);
          }
        }
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellations
        console.log("Processing customer.subscription.deleted");
        const canceledSubscription = event.data.object;
        const subscriptionId3 = canceledSubscription.id;
        
        // Find subscription in database
        const { data: canceledSubData, error: findCanceledError } = await supabaseClient
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId3)
          .single();
          
        if (findCanceledError && findCanceledError.code !== 'PGRST116') {
          throw findCanceledError;
        }
        
        if (canceledSubData?.user_id) {
          await supabaseClient
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', canceledSubData.user_id);
        }
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
