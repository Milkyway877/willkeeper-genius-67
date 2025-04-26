
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
    const { query, conversation_history, extracted_responses, contacts } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({
        error: "Missing query parameter"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Log the received data
    console.log("Processing documents query:", query);
    
    // Create prompt based on extracted information
    let systemPrompt = `You are SKYLER, an AI assistant specializing in will creation and estate planning.
You are currently in the DOCUMENT COLLECTION phase of creating a will.
Based on the previous conversation and the extracted information, you need to guide the user to upload relevant supporting documents.

Relevant extracted information:
`;

    // Add specific information from extracted responses
    for (const [key, value] of Object.entries(extracted_responses)) {
      systemPrompt += `- ${key}: ${value}\n`;
    }
    
    // Add information about contacts
    if (contacts && contacts.length > 0) {
      systemPrompt += "\nContacts collected:\n";
      contacts.forEach((contact: any) => {
        systemPrompt += `- ${contact.name} (${contact.role})\n`;
      });
    }

    // Add specific instructions
    systemPrompt += `
Guide the user to upload documents that are relevant to their will, such as:

1. Property deeds or titles
2. Financial account statements
3. Business ownership documents
4. Digital asset information
5. Insurance policies
6. Previous will or trust documents
7. Marriage certificates
8. Birth certificates for children

Request documents ONE BY ONE based on what the user has mentioned in their will information.
Be conversational and explain why each document is relevant to their will.
Acknowledge when the user uploads a document and ask if they have more documents to upload.
Once the user indicates they're done uploading documents, let them know the document collection phase is complete.
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
          request_type: 'will_documents',
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
    console.error("Error in will-documents-assistant function:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error: " + error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
