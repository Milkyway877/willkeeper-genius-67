
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
  
  try {
    // Parse request body
    const { user_id, email } = await req.json();
    
    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: user_id and email" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log(`Creating Stripe customer for user: ${email}`);
    
    // Initialize Stripe with secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe secret key not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        user_id: user_id
      }
    });
    
    console.log(`Successfully created Stripe customer: ${customer.id}`);
    
    // Initialize Supabase client to update the user profile
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Updating user ${user_id} with Stripe customer ID ${customer.id}`);
    
    // Update the user_profiles table with the Stripe customer ID
    try {
      console.log("Adding stripe_customer_id column to user_profiles table");
      // This ensures the column exists if it doesn't already
      await supabase.rpc('add_column_if_not_exists', { 
        p_table_name: 'user_profiles', 
        p_column_name: 'stripe_customer_id', 
        p_column_type: 'text' 
      });
    
      const { error } = await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user_id);
      
      if (error) {
        console.error("Error updating user with Stripe customer ID:", error);
        throw new Error(`Failed to update user with Stripe customer ID: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating user with Stripe customer ID:", error);
      throw new Error(`Failed to update user with Stripe customer ID: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        customer_id: customer.id
      }),
      { 
        status: 200, 
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: corsHeaders
      }
    );
  }
});
