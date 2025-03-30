
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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
  
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeSecretKey || !webhookSecret) {
    console.error("Missing Stripe configuration");
    return new Response(
      JSON.stringify({ error: "Server misconfigured" }),
      { status: 500, headers: corsHeaders }
    );
  }
  
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });
  
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    console.error("No Stripe signature found");
    return new Response(
      JSON.stringify({ error: "No Stripe signature found" }),
      { status: 400, headers: corsHeaders }
    );
  }
  
  try {
    // Get request body
    const body = await req.text();
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Received webhook event: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        const billingPeriod = session.metadata?.billing_period;
        
        if (!userId || !plan) {
          console.error("Missing metadata in checkout session");
          break;
        }
        
        console.log(`Processing completed checkout for user: ${userId}, plan: ${plan}, billing: ${billingPeriod}`);
        
        // For subscription payments
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          // Insert or update the subscription in the database
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            stripe_price_id: subscription.items.data[0].price.id,
            status: 'active',
            product_id: subscription.items.data[0].price.product,
            plan: plan,
            billing_period: billingPeriod,
            start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          
          if (error) {
            console.error("Error saving subscription:", error);
            break;
          }
        } 
        // For one-time payments (lifetime plans)
        else if (session.mode === 'payment') {
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            status: 'active', 
            plan: plan,
            billing_period: 'lifetime',
            start_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          
          if (error) {
            console.error("Error saving payment info:", error);
            break;
          }
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        console.log(`Subscription updated for customer: ${customerId}`);
        
        // Get the user ID from the customer metadata
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.user_id;
        
        if (!userId) {
          console.error("Missing user_id in customer metadata");
          break;
        }
        
        // Update the subscription in the database
        const { error } = await supabase.from('subscriptions').update({
          status: subscription.status,
          start_date: new Date(subscription.current_period_start * 1000).toISOString(),
          end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }).eq('user_id', userId);
        
        if (error) {
          console.error("Error updating subscription:", error);
          break;
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        console.log(`Subscription deleted for customer: ${customerId}`);
        
        // Get the user ID from the customer metadata
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.user_id;
        
        if (!userId) {
          console.error("Missing user_id in customer metadata");
          break;
        }
        
        // Update the subscription status in the database
        const { error } = await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        }).eq('user_id', userId);
        
        if (error) {
          console.error("Error updating subscription status:", error);
          break;
        }
        
        break;
      }
    }
    
    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders }
    );
  }
});
