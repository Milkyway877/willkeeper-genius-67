
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Parse request body
    const { query, conversation_history } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({
        error: "Missing query parameter"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    console.log("Processing query:", query);
    
    // Simulate AI response based on the query
    let response = '';
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('will') && (lowerQuery.includes('create') || lowerQuery.includes('make'))) {
      response = "Creating a will with WillTank is simple. I can guide you through the process step by step. Would you like to start with a traditional will, digital assets will, or a living trust?";
    } else if (lowerQuery.includes('digital asset')) {
      response = "Our digital asset will template helps you secure your online presence and digital valuables. This includes cryptocurrencies, online accounts, and digital memorabilia.";
    } else if (lowerQuery.includes('thank')) {
      response = "You're welcome! I'm here to help with any other estate planning questions you might have.";
    } else {
      response = "As your WillTank AI assistant, I can help with estate planning, will creation, trusts, and legacy planning. What specific aspect are you interested in learning more about?";
    }
    
    return new Response(JSON.stringify({
      response: response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error("Error in AI assistant function:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error: " + error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
