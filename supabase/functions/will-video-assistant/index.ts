
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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }

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
    
    // Log the received data
    console.log("Processing video testament query:", query);
    
    // Create prompt based on extracted information
    let systemPrompt = `You are SKYLER, an AI assistant specializing in will creation and estate planning.
You are currently in the VIDEO TESTAMENT phase of creating a will.
You need to guide the user through recording a video testament to accompany their will.

Key points to cover:

1. Explain the value of a video testament:
   - Personal touch to legal documents
   - Provides context to written instructions
   - Helps prevent future disputes
   - Shows clear intent

2. Guide the user on what to say in their video:
   - State their full name, date, and that they are of sound mind
   - Confirm this video supplements their written will
   - Explain key decisions in their will (e.g., guardian choices, specific bequests)
   - Express personal messages to loved ones (optional)

3. Practical recording tips:
   - Find a quiet location
   - Ensure good lighting
   - Speak clearly
   - Keep it concise (3-5 minutes ideal)
   - Look at the camera

Interact conversationally with the user. Answer questions they have about the video testament.
When they're ready to record, tell them to click the camera icon.
After they've recorded, acknowledge it and ask if they want to re-record or proceed.
When they're satisfied, let them know the video testament has been successfully recorded.
`;

    // Call OpenAI to process the request
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversation_history || []),
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await openaiResponse.json();
    const assistantResponse = data.choices[0].message.content;

    console.log("Assistant response:", assistantResponse);

    // Get user authentication if available
    let authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_ANON_KEY') || ''
      );
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
        console.log("Authenticated user:", userId);
      }
    }

    // Store the interaction if there's an authenticated user
    if (userId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_ANON_KEY') || ''
        );
        
        await supabase.from('ai_interactions').insert({
          user_id: userId,
          request_type: 'will_video',
          response: JSON.stringify({ query, response: assistantResponse })
        });
      } catch (dbError) {
        console.error("Error storing interaction:", dbError);
        // Continue even if storage fails
      }
    }
    
    return new Response(JSON.stringify({
      response: assistantResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error("Error in will-video-assistant function:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error: " + error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
