
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
    console.log(`Current progress:`, progress);
    console.log(`Current extracted data:`, extracted_data);
    console.log(`Current contacts:`, contacts);
    
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
    
    // Add context about what we already know
    if (Object.keys(extracted_data).length > 0) {
      messages.push({
        role: "system", 
        content: `Context - Information I already have about you: ${JSON.stringify(extracted_data)}`
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

    console.log("Assistant response:", assistantResponse);

    // Extract more information from both query and response
    const updatedExtractedData = extractMoreInformation(query, assistantResponse, extracted_data);
    
    // Process the AI response to extract any contact information
    const updatedContacts = processContactsFromResponse(assistantResponse, contacts, updatedExtractedData);
    
    // Check if all required data has been collected
    const updatedProgress = analyzeProgressFromResponse(assistantResponse, progress, updatedExtractedData, updatedContacts, conversation_history.length);
    
    // Always force ready status after a few exchanges
    const forceReady = conversation_history.length >= 4 && query.length > 0;
    if (forceReady && !updatedProgress.readyToComplete) {
      updatedProgress.readyToComplete = true;
      console.log("Force setting readyToComplete to true due to conversation length");
    }
    
    // Save the conversation data to the database if user is authenticated
    if (user) {
      try {
        const conversationData = {
          conversation_data: [...conversation_history, { role: "user", content: query }, { role: "assistant", content: assistantResponse }],
          extracted_entities: updatedExtractedData
        };
        
        const { data: savedData, error: saveError } = await supabaseClient
          .from('will_ai_conversations')
          .insert([conversationData])
          .select();
          
        if (saveError) {
          console.error('Error saving conversation data:', saveError);
        } else {
          console.log('Saved conversation data:', savedData);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        contacts: updatedContacts,
        extracted_data: updatedExtractedData,
        progress: updatedProgress,
        isComplete: updatedProgress.readyToComplete
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

// Enhanced information extraction function that gets more data from both query and response
function extractMoreInformation(query: string, response: string, currentData: any): any {
  const combinedText = query + " " + response;
  const data = { ...currentData };
  
  // Name extraction with enhanced patterns
  const namePatterns = [
    /(?:my name is|I am|I'm|name's|call me) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i,
    /([A-Z][a-z]+ [A-Z][a-z]+) (?:here|speaking)/i,
    /(?:This is) ([A-Z][a-z]+ [A-Z][a-z]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = combinedText.match(pattern);
    if (nameMatch && nameMatch[1] && !data.fullName) {
      data.fullName = nameMatch[1].trim();
      break;
    }
  }
  
  // Try to extract name if first word is capitalized (likely a name)
  if (!data.fullName && query.length > 0) {
    const words = query.trim().split(/\s+/);
    if (words.length >= 2 && 
        words[0].charAt(0) === words[0].charAt(0).toUpperCase() && 
        words[1].charAt(0) === words[1].charAt(0).toUpperCase()) {
      data.fullName = `${words[0]} ${words[1]}`;
      
      // Check if there might be more name parts
      if (words.length >= 3 && words[2].charAt(0) === words[2].charAt(0).toUpperCase() && !/[,.!?]/.test(words[2])) {
        data.fullName += ` ${words[2]}`;
      }
    }
  }
  
  // Marital status extraction
  const maritalStatusPatterns = [
    /(?:I am|I'm) (single|married|divorced|widowed)/i,
    /marital status(?:\s+is)? (single|married|divorced|widowed)/i,
    /(?:I'm|I am)(?: currently)? (single|married|divorced|widowed)/i
  ];
  
  for (const pattern of maritalStatusPatterns) {
    const statusMatch = combinedText.match(pattern);
    if (statusMatch && statusMatch[1] && !data.maritalStatus) {
      data.maritalStatus = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1).toLowerCase();
      break;
    }
  }
  
  // Spouse extraction
  const spousePatterns = [
    /(?:my spouse|my husband|my wife|married to) (?:is |)([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i,
    /(?:partner|spouse) (?:is|being|named) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i
  ];
  
  for (const pattern of spousePatterns) {
    const spouseMatch = combinedText.match(pattern);
    if (spouseMatch && spouseMatch[1] && !data.spouseName) {
      data.spouseName = spouseMatch[1].trim();
      break;
    }
  }
  
  // Children extraction
  const childrenPatterns = [
    /(?:I have|with) (?:a|one|1) (?:child|daughter|son)(?: named| called)? ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i,
    /(?:my|the) (?:child|daughter|son)(?:'s name)? is ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i,
  ];
  
  for (const pattern of childrenPatterns) {
    const childMatch = combinedText.match(pattern);
    if (childMatch && childMatch[1] && !data.childrenNames) {
      data.hasChildren = true;
      data.childrenNames = childMatch[1].trim();
      break;
    }
  }
  
  // Executor extraction with enhanced patterns
  const executorPatterns = [
    /(?:executor|appoint|choose|select|want|designate)(?: my| the)? ([A-Z][a-z]+(?: [A-Z][a-z]+)+)(?: as(?: my)? executor)?/i,
    /([A-Z][a-z]+ [A-Z][a-z]+) (?:will|should|can) be (?:my|the) executor/i,
    /executor(?:'s| is| will be) ([A-Z][a-z]+ [A-Z][a-z]+)/i
  ];
  
  for (const pattern of executorPatterns) {
    const executorMatch = combinedText.match(pattern);
    if (executorMatch && executorMatch[1] && !data.executorName) {
      data.executorName = executorMatch[1].trim();
      break;
    }
  }
  
  // Email extraction
  const emailMatches = combinedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatches && emailMatches.length > 0) {
    data.executorEmail = emailMatches[0];
    
    // Check if there are multiple emails in context with names
    if (emailMatches.length > 1) {
      // Try to match emails to names in the same sentence
      const sentences = combinedText.split(/[.!?]/);
      for (const sentence of sentences) {
        if (sentence.match(/executor|appoint|choose|select/i)) {
          const emailInSentence = sentence.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailInSentence) {
            data.executorEmail = emailInSentence[0];
            break;
          }
        }
      }
    }
  }
  
  // Phone extraction
  const phoneMatches = combinedText.match(/(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g);
  if (phoneMatches && phoneMatches.length > 0) {
    data.executorPhone = phoneMatches[0];
    
    // Check if there are multiple phone numbers in context with names
    if (phoneMatches.length > 1) {
      // Try to match phone numbers to names in the same sentence
      const sentences = combinedText.split(/[.!?]/);
      for (const sentence of sentences) {
        if (sentence.match(/executor|appoint|choose|select/i)) {
          const phoneInSentence = sentence.match(/(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
          if (phoneInSentence) {
            data.executorPhone = phoneInSentence[0];
            break;
          }
        }
      }
    }
  }
  
  // Guardian extraction
  const guardianPatterns = [
    /(?:guardian for|guardian is|guardian|take care of) (?:my|the) (?:child|children|daughter|son)(?:ren)? (?:is |would be |will be |should be )?([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i,
    /([A-Z][a-z]+(?: [A-Z][a-z]+)+) (?:as|to be|will be|should be) (?:my|the) guardian/i,
    /(?:appoint|designate|choose) ([A-Z][a-z]+(?: [A-Z][a-z]+)+) (?:as|to be) (?:the |my )?guardian/i
  ];
  
  for (const pattern of guardianPatterns) {
    const guardianMatch = combinedText.match(pattern);
    if (guardianMatch && guardianMatch[1] && !data.guardianName) {
      data.guardianName = guardianMatch[1].trim();
      data.guardianNeeded = true;
      break;
    }
  }
  
  // Property address extraction
  const propertyPatterns = [
    /(?:I have|I own|my house|my property|my home)(?: is| at)? (?:located at |at )?([\d]+ [A-Za-z]+ (?:Road|Street|Avenue|Drive|Lane|Place|Blvd|Boulevard|Way|Court|Terrace|Circle)[, ]+[A-Za-z]+(?:[, ]+[A-Za-z]+)?)/i,
    /(?:house|property|home) (?:at|on) ([\d]+ [A-Za-z]+ (?:Road|Street|Avenue|Drive|Lane|Place|Blvd|Boulevard|Way|Court|Terrace|Circle))/i
  ];
  
  for (const pattern of propertyPatterns) {
    const propertyMatch = combinedText.match(pattern);
    if (propertyMatch && propertyMatch[1] && !data.propertyAddress) {
      data.propertyAddress = propertyMatch[1].trim();
      break;
    }
  }
  
  // Vehicle extraction
  const vehiclePatterns = [
    /(?:I have|I own|my car|my vehicle) (?:is |a )?((?:[A-Za-z]+ )?[A-Za-z]+ [A-Za-z0-9]+)/i,
    /(?:drive|own|have) (?:a |an )?([A-Za-z]+ (?:car|vehicle|truck|SUV|motorcycle|van|bus))/i
  ];
  
  for (const pattern of vehiclePatterns) {
    const vehicleMatch = combinedText.match(pattern);
    if (vehicleMatch && vehicleMatch[1] && !data.vehicle) {
      data.vehicle = vehicleMatch[1].trim();
      break;
    }
  }
  
  // Extract additional data points common in will creation
  if (combinedText.includes("children") && !data.hasChildren) {
    data.hasChildren = combinedText.includes("no children") ? false : true;
  }

  console.log("Extracted data:", data);
  return data;
}

function processContactsFromResponse(aiResponse: string, currentContacts: ContactType[], extractedData: any): ContactType[] {
  const contacts = [...currentContacts];
  
  // Check for executor mentions in extracted data and add if not exists
  if (extractedData.executorName && !contacts.some(c => c.name.toLowerCase() === extractedData.executorName.toLowerCase())) {
    contacts.push({
      id: `contact-${Date.now()}`,
      name: extractedData.executorName,
      role: 'Executor',
      email: extractedData.executorEmail || '',
      phone: extractedData.executorPhone || '',
      address: ''
    });
    console.log(`Added executor contact: ${extractedData.executorName}`);
  } else if (extractedData.executorName) {
    // Update existing contact with new information if available
    contacts.forEach((contact, index) => {
      if (contact.name.toLowerCase() === extractedData.executorName.toLowerCase()) {
        contacts[index] = {
          ...contact,
          email: extractedData.executorEmail || contact.email,
          phone: extractedData.executorPhone || contact.phone
        };
      }
    });
  }
  
  // Check for guardian mentions in the extracted data
  if (extractedData.guardianName && !contacts.some(c => c.name.toLowerCase() === extractedData.guardianName.toLowerCase())) {
    contacts.push({
      id: `contact-${Date.now() + 1}`,
      name: extractedData.guardianName,
      role: 'Guardian',
      email: '',
      phone: '',
      address: ''
    });
    console.log(`Added guardian contact: ${extractedData.guardianName}`);
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
            if (line.toLowerCase().includes(contact.name.toLowerCase()) && !contact.email) {
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
            if (line.toLowerCase().includes(contact.name.toLowerCase()) && !contact.phone) {
              contacts[i] = { ...contact, phone };
              break;
            }
          }
        }
      }
    }
  }
  
  console.log("Updated contacts:", contacts);
  return contacts;
}

function analyzeProgressFromResponse(
  aiResponse: string, 
  currentProgress: any, 
  extractedData: any,
  contacts: ContactType[],
  messageCount: number
): any {
  const progress = { ...currentProgress };
  
  // Check for personal info completion - just need a name
  if (extractedData.fullName) {
    progress.personalInfo = true;
    console.log("Personal info marked as complete");
  }
  
  // Check for contacts - just need one contact with a role
  if (contacts.length > 0 && contacts.some(c => c.role)) {
    progress.contacts = true;
    console.log("Contacts marked as complete");
  }
  
  // Set ready to complete if we have the minimum requirements
  if (progress.personalInfo && progress.contacts) {
    progress.readyToComplete = true;
    console.log("Ready to complete is now true");
  }
  
  // Force ready after enough messages even without all data
  if (messageCount >= 4) {
    progress.readyToComplete = true;
    console.log("Forcing ready to complete due to message count");
  }
  
  return progress;
}
