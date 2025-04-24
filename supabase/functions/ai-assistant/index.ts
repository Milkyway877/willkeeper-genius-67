
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
    
    // Log the received query
    console.log("Processing query:", query);
    
    let authHeader = req.headers.get('Authorization');
    let userId = null;
    
    // Verify authentication if present
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
        console.log("Authenticated user:", userId);
      }
    }
    
    // Simulate AI response based on the query
    let response = '';
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('will') && (lowerQuery.includes('create') || lowerQuery.includes('make'))) {
      response = "Creating a will with WillTank is simple. I can guide you through the process step by step. Would you like to start with a traditional will, digital assets will, or a living trust?";
    } else if (lowerQuery.includes('digital asset')) {
      response = "Our digital asset will template helps you secure your online presence and digital valuables. This includes cryptocurrencies, online accounts, and digital memorabilia.";
    } else if (lowerQuery.includes('thank')) {
      response = "You're welcome! I'm here to help with any other estate planning questions you might have.";
    } else if (lowerQuery.includes('estate') || lowerQuery.includes('planning')) {
      response = "Estate planning is crucial for ensuring your assets are distributed according to your wishes. At WillTank, we offer comprehensive solutions including wills, trusts, and digital asset management. Would you like specific information about any of these options?";
    } else if (lowerQuery.includes('trust') || lowerQuery.includes('living trust')) {
      response = "A living trust allows you to place your assets in a trust while you're still alive, potentially avoiding probate and providing more control over distribution. WillTank can help you create a customized living trust with all necessary legal protections.";
    } else if (lowerQuery.includes('beneficiary') || lowerQuery.includes('heir')) {
      response = "Beneficiaries are individuals or organizations that receive assets from your estate. With WillTank, you can easily specify multiple beneficiaries, set inheritance conditions, and even leave specific items to particular people.";
    } else {
      response = "As your WillTank AI assistant, I can help with estate planning, will creation, trusts, and legacy planning. What specific aspect are you interested in learning more about?";
    }
    
    // Store the interaction if there's an authenticated user
    if (userId) {
      try {
        await supabase.from('ai_interactions').insert({
          user_id: userId,
          request_type: 'estate_planning_chat',
          response: JSON.stringify({ query, response })
        });
      } catch (dbError) {
        console.error("Error storing interaction:", dbError);
        // Continue even if storage fails
      }
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
