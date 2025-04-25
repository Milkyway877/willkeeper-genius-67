
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
    const { query, template_type, conversation_history } = await req.json();
    
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
    console.log("Template type:", template_type);
    
    // Create prompt based on template type
    let systemPrompt = `You are an expert legal assistant specializing in wills and estate planning. 
You are helping the user create a ${template_type || 'traditional'} will. 
Be professional but conversational, collecting all necessary information in a thorough manner.
Ask clear questions one at a time, collect answers, and provide brief guidance.
Focus on clarity and thoroughness as this will be used to generate a legal document.`;

    // Add specific instructions based on template type
    if (template_type === 'digital-assets') {
      systemPrompt += `
Focus especially on digital assets including:
- Cryptocurrency holdings and wallet access
- Online accounts and services
- Digital intellectual property
- Social media account handling instructions
- Password manager information (without collecting actual passwords)`;
    } else if (template_type === 'living-trust') {
      systemPrompt += `
Focus especially on trust details including:
- Trust name and type
- Trustee and successor trustee information
- Trust assets and property
- Distribution rules and conditions
- Powers granted to trustees`;
    }

    // Add general instructions for legal compliance
    systemPrompt += `
Make sure to collect:
1. Full legal name and address
2. Marital status and spouse name if applicable
3. Children's names if applicable
4. Executor and alternate executor names
5. Guardian information for minor children if applicable
6. Specific bequests of property or assets
7. Residuary estate distribution plan

Always maintain a professional tone appropriate for legal document preparation.`;

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
          request_type: 'will_creation',
          response: JSON.stringify({ query, response: assistantResponse, template_type })
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
    console.error("Error in GPT will assistant function:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error: " + error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
