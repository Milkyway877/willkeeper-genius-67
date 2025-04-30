
// Follow this setup guide to integrate the Deno runtime and handle Edge Functions locally: https://deno.land/manual/getting_started/setup_your_environment
// Edge Functions use the Fetch API to respond to requests: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// Learn more at https://deno.land/manual/runtime/http/fetch_api
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ContactType = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const {
      query,
      template_type,
      conversation_history = [],
      progress = {},
      extracted_data = {},
      contacts = []
    } = await req.json();

    console.log(`Processing query: ${query}`);
    console.log(`Template type: ${template_type}`);
    
    // Get the current auth session
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Try to get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError.message);
    } else if (user) {
      console.log(`Authenticated user: ${user.id}`);
    }

    // Form the AI prompt based on the conversation and template type
    const systemPrompt = getSystemPrompt(template_type);
    
    // Create the OpenAI messages array
    const messages = [
      { role: "system", content: systemPrompt },
    ];
    
    // Add the conversation history
    if (conversation_history && conversation_history.length > 0) {
      conversation_history.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }
    
    // Add the current query
    messages.push({ role: "user", content: query });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }
    
    // Call the OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }
    
    const openaiData = await openaiResponse.json();
    const assistantResponse = openaiData.choices[0].message.content;

    // Process the AI response to extract any contact information
    const updatedContacts = processContactsFromResponse(assistantResponse, contacts, extracted_data);
    
    // Check if we need to trigger a video recording
    const triggerVideo = shouldTriggerVideo(assistantResponse, progress);
    
    // Check if all required data has been collected
    const updatedProgress = analyzeProgressFromResponse(assistantResponse, progress, extracted_data, updatedContacts);
    
    // Check if we're ready to complete
    const isComplete = checkIfComplete(updatedProgress);

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        contacts: updatedContacts,
        extracted_data: extracted_data,
        progress: updatedProgress,
        triggerVideo,
        isComplete
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

function getSystemPrompt(templateType: string): string {
  let basePrompt = `You are SKYLER, an AI assistant specialized in helping users create their will. Guide the user through a natural conversation to gather all necessary information.

Follow these key principles:
1. Ask one question at a time to avoid overwhelming the user
2. When the user mentions a person (like an executor or beneficiary), ask follow-up questions to get their contact information (email, phone)
3. If the user mentions assets or property, ask for supporting documentation
4. Be conversational and empathetic - creating a will is a sensitive topic
5. Help the user understand legal terms and concepts in simple language

IMPORTANT: After gathering basic personal information, ask for the user's executor information including name, email, and phone. This is the most critical contact to collect.

If you notice the user has provided all personal information and at least one executor with contact details, suggest recording a video testament to add a personal touch to their will.`;

  if (templateType === 'digital-assets') {
    basePrompt += `\n\nFocus on digital assets such as:
- Cryptocurrency accounts and wallets
- Social media accounts
- Email accounts
- Digital files, photos, and documents
- Online gaming accounts
- Domain names
- Digital intellectual property

Ask specifically about access methods, passwords, and how they'd like these assets handled.`;
  } else if (templateType === 'business') {
    basePrompt += `\n\nFocus on business succession planning:
- Business ownership structure
- Succession plans for the business
- Key employees or partners
- Business assets and valuation
- Buy-sell agreements`;
  }

  return basePrompt;
}

function processContactsFromResponse(aiResponse: string, currentContacts: ContactType[], extractedData: any): ContactType[] {
  const contacts = [...currentContacts];
  
  // Check for executor mentions in the AI response
  if (aiResponse.includes('executor') && extractedData.executorName && !contacts.some(c => c.role === 'Executor')) {
    contacts.push({
      id: `contact-${Date.now()}`,
      name: extractedData.executorName,
      role: 'Executor',
      email: '',
      phone: '',
      address: ''
    });
  }
  
  // Check for guardian mentions in the AI response
  if (aiResponse.includes('guardian') && extractedData.guardianName && !contacts.some(c => c.role === 'Guardian')) {
    contacts.push({
      id: `contact-${Date.now() + 1}`,
      name: extractedData.guardianName,
      role: 'Guardian',
      email: '',
      phone: '',
      address: ''
    });
  }
  
  // Look for email addresses in the response that might belong to existing contacts
  const emailMatches = aiResponse.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatches) {
    for (const email of emailMatches) {
      // Try to match this email to a contact mentioned in the same context
      const contextLines = aiResponse.split('.');
      for (const line of contextLines) {
        if (line.includes(email)) {
          for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            if (line.includes(contact.name) && !contact.email) {
              contacts[i] = { ...contact, email };
              break;
            }
          }
        }
      }
    }
  }
  
  // Look for phone numbers in the response
  const phoneMatches = aiResponse.match(/(\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
  if (phoneMatches) {
    for (const phone of phoneMatches) {
      // Try to match this phone to a contact mentioned in the same context
      const contextLines = aiResponse.split('.');
      for (const line of contextLines) {
        if (line.includes(phone)) {
          for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            if (line.includes(contact.name) && !contact.phone) {
              contacts[i] = { ...contact, phone };
              break;
            }
          }
        }
      }
    }
  }
  
  return contacts;
}

function analyzeProgressFromResponse(
  aiResponse: string, 
  currentProgress: any, 
  extractedData: any,
  contacts: ContactType[]
): any {
  const progress = { ...currentProgress };
  
  // Check for personal info completion
  if (extractedData.fullName && (extractedData.maritalStatus || aiResponse.includes('marital status'))) {
    progress.personalInfo = true;
  }
  
  // Check for contacts completion
  const hasExecutor = contacts.some(c => c.role === 'Executor' && (c.email || c.phone));
  if (hasExecutor) {
    progress.contacts = true;
  }
  
  // Check for document requests in the AI's response
  if (aiResponse.toLowerCase().includes('upload') && 
      (aiResponse.toLowerCase().includes('document') || aiResponse.toLowerCase().includes('proof'))) {
    progress.documentsRequested = true;
  }
  
  return progress;
}

function shouldTriggerVideo(aiResponse: string, progress: any): boolean {
  const personalInfoComplete = progress.personalInfo === true;
  const contactsComplete = progress.contacts === true;
  
  // Only trigger video if we've collected personal info and contacts
  if (personalInfoComplete && contactsComplete) {
    // Check if the AI is asking about video recording
    return aiResponse.toLowerCase().includes('video testament') || 
           aiResponse.toLowerCase().includes('record a video') ||
           aiResponse.toLowerCase().includes('video recording');
  }
  
  return false;
}

function checkIfComplete(progress: any): boolean {
  // Consider the process complete when we have personal info, contacts, and either documents or video
  return progress.personalInfo === true && 
         progress.contacts === true && 
         (progress.documents === true || progress.video === true);
}
