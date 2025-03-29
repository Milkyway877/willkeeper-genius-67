
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

  // Set up Supabase client with service role for admin privileges
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    // Get user information from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Error getting user data: " + (userError?.message || "User not found"));
    }

    // Check if user already has a Stripe customer ID in our database
    const { data: userData, error: profileError } = await supabaseAdmin
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId;

    if (userData?.stripe_customer_id) {
      console.log("User already has a Stripe customer ID:", userData.stripe_customer_id);
      customerId = userData.stripe_customer_id;
      
      // Verify the customer still exists in Stripe
      try {
        const existingCustomer = await stripe.customers.retrieve(customerId);
        if (existingCustomer && !existingCustomer.deleted) {
          // Return the existing customer
          return new Response(
            JSON.stringify({ customerId, isNew: false }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      } catch (error) {
        console.log("Error retrieving Stripe customer, will create a new one:", error.message);
        // Continue to create a new customer if the existing one is invalid
      }
    }

    // Parse the request body
    const { name, email } = await req.json();

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email: email || user.email,
      name: name || user.user_metadata?.full_name,
      metadata: {
        supabaseUserId: user.id,
      },
    });

    customerId = customer.id;

    // Store the Stripe customer ID in our database
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error storing Stripe customer ID:", updateError);
      throw new Error("Error storing Stripe customer ID: " + updateError.message);
    }

    // Return the new customer
    return new Response(
      JSON.stringify({ customerId, isNew: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-stripe-customer function:", error);
    
    // Return a user-friendly error message
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
