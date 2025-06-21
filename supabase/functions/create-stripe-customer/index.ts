
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        customer_id: customers.data[0].id,
        message: 'Customer already exists'
      }), { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      metadata: {
        supabase_user_id: user.id
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      customer_id: customer.id,
      message: 'Customer created successfully'
    }), { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
