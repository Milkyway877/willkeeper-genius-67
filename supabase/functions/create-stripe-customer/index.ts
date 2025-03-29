
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.9.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORS headers for cross-origin requests
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
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Parse request body
    const { user_id, email, name } = await req.json();
    
    if (!user_id || !email) {
      throw new Error('User ID and email are required');
    }
    
    console.log(`Creating Stripe customer for user: ${email}`);

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        supabaseUserId: user_id
      }
    });
    
    console.log(`Successfully created Stripe customer: ${customer.id}`);
    
    // Set up Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Store the Stripe customer ID in the users table
    console.log(`Updating user ${user_id} with Stripe customer ID ${customer.id}`);
    
    // First check if the stripe_customer_id column exists in the users table
    const { data: columnExists, error: columnCheckError } = await supabase.rpc(
      'check_column_exists',
      { p_table_name: 'user_profiles', p_column_name: 'stripe_customer_id' }
    );
    
    if (columnCheckError) {
      console.error("Error checking if column exists:", columnCheckError);
      // We'll try to add the column even if the check fails
    }
    
    // If the column doesn't exist, add it
    if (!columnExists) {
      console.log("Adding stripe_customer_id column to user_profiles table");
      await supabase.rpc(
        'add_column_if_not_exists',
        { 
          p_table_name: 'user_profiles', 
          p_column_name: 'stripe_customer_id', 
          p_column_type: 'text' 
        }
      );
    }
    
    // Update the user with the Stripe customer ID
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", user_id);
    
    if (updateError) {
      console.error("Error updating user with Stripe customer ID:", updateError);
      throw new Error(`Failed to update user with Stripe customer ID: ${updateError.message}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, customer_id: customer.id }),
      {
        headers: corsHeaders,
        status: 200
      }
    );
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An error occurred creating Stripe customer"
      }),
      {
        headers: corsHeaders,
        status: 400
      }
    );
  }
});
