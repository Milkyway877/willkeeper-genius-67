
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
    console.error("Missing Stripe secret key or webhook secret");
    return new Response(
      JSON.stringify({ error: "Server misconfigured" }),
      { status: 500, headers: corsHeaders }
    );
  }
  
  // Set up Supabase client with service role key for admin access
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });
  
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No stripe signature in request");
      return new Response(
        JSON.stringify({ error: "No signature" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Get the raw request body
    const body = await req.text();
    
    // Verify and construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log(`Received Stripe webhook event: ${event.type}`);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session, supabase);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription, supabase, stripe);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription, supabase);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(invoice, supabase, stripe);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice, supabase);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${error.message}` }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// Handler functions for each event type
async function handleCheckoutSessionCompleted(session: any, supabase: any) {
  try {
    console.log('Processing checkout.session.completed event');
    console.log('Session metadata:', session.metadata);
    
    // Skip if no user_id in metadata
    if (!session.metadata?.user_id) {
      console.log('No user_id in session metadata, skipping');
      return;
    }
    
    // For one-time payments (lifetime plans)
    if (session.mode === 'payment') {
      await supabase.from('subscriptions').insert({
        user_id: session.metadata.user_id,
        stripe_customer_id: session.customer,
        status: 'active',
        plan: session.metadata.plan,
        billing_period: session.metadata.billing_period,
        start_date: new Date().toISOString(),
        // Set a far future date for lifetime plans
        end_date: new Date(2099, 11, 31).toISOString(),
        stripe_price_id: session.line_items?.data[0]?.price?.id
      });
      
      console.log('Created lifetime subscription record');
    }
    
    // For subscription payments, we'll handle in the subscription events
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any, stripe: any) {
  try {
    console.log('Processing subscription event');
    
    // Get customer to find user_id
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    if (!customer?.metadata?.supabase_uid) {
      console.log('No supabase_uid in customer metadata, trying to find user via stripe_customer_id');
      
      // Try to find user via the stripe_customer_id in the user_profiles table
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single();
      
      if (userError || !userData) {
        console.error('Could not find user for subscription', userError);
        return;
      }
      
      // Get the subscription items to get the price ID
      const { data: items } = await stripe.subscriptionItems.list({
        subscription: subscription.id,
      });
      
      // Find or create subscription record
      const { data: existingSub, error: findError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', subscription.id)
        .single();
      
      const priceId = items.data[0]?.price?.id;
      const productId = items.data[0]?.price?.product;
      
      // Determine plan and billing period from the product
      let plan = 'unknown';
      let billingPeriod = 'unknown';
      
      // Map product IDs to plans and billing periods
      const productMap = {
        'prod_S24mg95AMIms1O': { plan: 'starter', period: 'monthly' },
        'prod_S24nzeS5Bi8BLr': { plan: 'starter', period: 'yearly' }, 
        'prod_S251guGbh50tje': { plan: 'starter', period: 'lifetime' },
        'prod_S24rv3q2Fscixp': { plan: 'gold', period: 'monthly' },
        'prod_S24sJE25TZiWmp': { plan: 'gold', period: 'yearly' },
        'prod_S252Aj8D5tFfXg': { plan: 'gold', period: 'lifetime' },
        'prod_S24uIjzixtsIhy': { plan: 'platinum', period: 'monthly' },
        'prod_S24vvPrNB1N2Rs': { plan: 'platinum', period: 'yearly' },
        'prod_S2537v7mpccHQI': { plan: 'platinum', period: 'lifetime' }
      };
      
      if (productId && productMap[productId]) {
        plan = productMap[productId].plan;
        billingPeriod = productMap[productId].period;
      }
      
      const subscriptionData = {
        user_id: userData.id,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        product_id: productId,
        plan: plan,
        billing_period: billingPeriod,
        status: subscription.status,
        start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        end_date: new Date(subscription.current_period_end * 1000).toISOString()
      };
      
      if (existingSub) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', existingSub.id);
        
        if (updateError) {
          console.error('Error updating subscription:', updateError);
        } else {
          console.log('Updated subscription record');
        }
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(subscriptionData);
        
        if (insertError) {
          console.error('Error creating subscription:', insertError);
        } else {
          console.log('Created subscription record');
        }
      }
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  try {
    console.log('Processing subscription deleted event');
    
    // Update subscription status to 'canceled'
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.id);
    
    if (error) {
      console.error('Error updating subscription to canceled:', error);
    } else {
      console.log('Marked subscription as canceled');
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any, supabase: any, stripe: any) {
  try {
    console.log('Processing invoice payment succeeded event');
    
    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log('Not a subscription invoice, skipping');
      return;
    }
    
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Update the subscription end date
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        end_date: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);
    
    if (error) {
      console.error('Error updating subscription after payment:', error);
    } else {
      console.log('Updated subscription end date after successful payment');
    }
  } catch (error) {
    console.error('Error handling invoice payment success:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  try {
    console.log('Processing invoice payment failed event');
    
    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log('Not a subscription invoice, skipping');
      return;
    }
    
    // Update the subscription status to reflect payment failure
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due'
      })
      .eq('stripe_subscription_id', invoice.subscription);
    
    if (error) {
      console.error('Error updating subscription after payment failure:', error);
    } else {
      console.log('Updated subscription status to past_due after failed payment');
    }
  } catch (error) {
    console.error('Error handling invoice payment failure:', error);
  }
}
