
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not found in environment variables");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get request data
    const { query, conversation_history } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: query" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Prepare conversation history for OpenAI
    const messages = [
      { 
        role: "system", 
        content: `You are the AI assistant for WillTank, a comprehensive estate planning and will creation platform. 
        
Your primary functions are:
1. Helping users understand different will types (traditional, digital assets, living trusts, etc.)
2. Explaining legal concepts related to estate planning in clear, understandable terms
3. Guiding users through creating wills using WillTank's templates and AI-guided process
4. Providing information about digital asset inheritance, including cryptocurrency
5. Explaining executor responsibilities and selection criteria
6. Clarifying trust benefits and creation processes
7. Helping with business succession planning
8. Advising on tax implications of different estate planning strategies

When providing information:
- Be accurate and comprehensive about estate planning concepts
- Relate answers specifically to WillTank's features and templates
- Remain conversational, warm, and accessible
- Emphasize WillTank's simplicity and comprehensive approach
- Acknowledge when certain estate planning situations might require professional legal counsel
- Always frame answers in the context of WillTank's platform capabilities

WillTank offers these main templates:
- Traditional Last Will & Testament 
- Digital Asset Will (for cryptocurrency, NFTs, online accounts)
- Living Trust & Estate Plan
- Charitable Bequest Will
- Business Succession Plan
- Pet Care Trust

WillTank's process includes:
1. Template selection
2. AI-guided questionnaire
3. Will document generation
4. Review and editing
5. Video testament recording
6. Supporting document uploads
7. Digital signature
8. Legal analysis
9. Payment and finalization

Never provide specific legal advice that would require a licensed attorney. If a user asks for jurisdiction-specific advice, recommend consulting an attorney. Focus on general estate planning principles and how WillTank implements them.` 
      }
    ];
    
    // Add conversation history
    if (conversation_history && Array.isArray(conversation_history)) {
      conversation_history.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }
    
    // Add the current query
    messages.push({
      role: "user",
      content: query
    });

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openAiData = await response.json();
    const assistantResponse = openAiData.choices[0].message.content;

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        response: assistantResponse 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
