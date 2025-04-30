
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
    const { query, conversation_history, extracted_responses } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({
        error: "Missing query parameter"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Log the received data
    console.log("Processing contact query:", query);
    console.log("Extracted responses:", extracted_responses);
    
    // Create prompt based on extracted information
    let systemPrompt = `You are SKYLER, an AI assistant specializing in will creation and estate planning.
You are currently in the CONTACT COLLECTION phase of creating a will.
Based on the previous conversation, you need to collect detailed contact information for all individuals mentioned.

Key individuals requiring contact information:
`;

    // Add specific individuals based on extracted responses
    if (extracted_responses.executorName) {
      systemPrompt += `- Executor: ${extracted_responses.executorName}\n`;
    }
    
    if (extracted_responses.alternateExecutorName) {
      systemPrompt += `- Alternate Executor: ${extracted_responses.alternateExecutorName}\n`;
    }
    
    if (extracted_responses.guardianName) {
      systemPrompt += `- Guardian: ${extracted_responses.guardianName}\n`;
    }

    // Check if all contacts have been collected to determine if we should send a completion message
    let allContactsCollected = false;
    
    // Check conversation history to see if we've collected information for all required contacts
    if (conversation_history && conversation_history.length > 0) {
      const requiredContacts = [];
      if (extracted_responses.executorName) requiredContacts.push(extracted_responses.executorName.toLowerCase());
      if (extracted_responses.alternateExecutorName) requiredContacts.push(extracted_responses.alternateExecutorName.toLowerCase());
      if (extracted_responses.guardianName) requiredContacts.push(extracted_responses.guardianName.toLowerCase());
      
      // Count how many contacts we have complete information for
      const contactsWithInfo = new Set();
      
      for (const message of conversation_history) {
        if (message.role === 'user') {
          const content = message.content.toLowerCase();
          // Check if message contains email or phone pattern
          const hasContactInfo = content.includes('@') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(content);
          
          if (hasContactInfo) {
            // Find which contact this message is about
            for (const contact of requiredContacts) {
              if (content.includes(contact.toLowerCase())) {
                contactsWithInfo.add(contact);
                break;
              }
            }
          }
        }
      }
      
      // If the current query includes contact info as well, consider it
      if (query.includes('@') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(query)) {
        for (const contact of requiredContacts) {
          if (query.toLowerCase().includes(contact.toLowerCase())) {
            contactsWithInfo.add(contact);
            break;
          }
        }
      }
      
      // Only set allContactsCollected to true if we have information for all required contacts
      // AND we have a decent number of messages (to avoid premature completion)
      allContactsCollected = requiredContacts.length > 0 && 
                             contactsWithInfo.size === requiredContacts.length && 
                             conversation_history.length >= (requiredContacts.length * 2);
    }

    // Add specific instructions
    systemPrompt += `
For each person, collect:
- Full name (confirm existing names)
- Email address
- Phone number
- Physical address

Ask for ONE PERSON'S information at a time.
Be conversational but focused on collecting accurate contact information.

IMPORTANT: Only indicate that the contact collection phase is complete after you have collected
all required information for ALL key individuals mentioned. Never say the collection is complete
until you've verified that ALL required contacts have complete information.
`;

    // Add instruction about completion messaging based on our check
    if (allContactsCollected) {
      systemPrompt += `
All required contacts now have their information collected. You should inform the user that
the contact collection phase is complete with the message:
"Great! I've collected all the necessary contact information for everyone mentioned in your will.
All contact information has been collected, and you can now proceed to the next step."
`;
    } else {
      systemPrompt += `
DO NOT tell the user that "All contact information has been collected" or that they can
"click the Continue button to proceed" until you've collected information for ALL required contacts.
`;
    }

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
          request_type: 'will_contacts',
          response: JSON.stringify({ query, response: assistantResponse })
        });
      } catch (dbError) {
        console.error("Error storing interaction:", dbError);
        // Continue even if storage fails
      }
    }
    
    return new Response(JSON.stringify({
      response: assistantResponse,
      allContactsCollected: allContactsCollected
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error("Error in will-contacts-assistant function:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error: " + error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
