
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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse request body
    const { will_id, conversation_data, user_id } = await req.json();
    
    if (!conversation_data) {
      return new Response(JSON.stringify({
        error: "Missing conversation data"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    console.log("Processing conversation data for will_id:", will_id);
    
    // Extract entities from conversation data
    const extractedEntities = extractEntitiesFromConversation(conversation_data);
    console.log("Extracted entities:", extractedEntities);
    
    // Store conversation data in the will_ai_conversations table
    let conversationRecord;
    
    if (will_id) {
      // Check if a record already exists for this will
      const { data: existingRecord, error: queryError } = await supabase
        .from('will_ai_conversations')
        .select('*')
        .eq('will_id', will_id)
        .maybeSingle();
      
      if (queryError) {
        throw queryError;
      }
      
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('will_ai_conversations')
          .update({ 
            conversation_data, 
            extracted_entities: extractedEntities 
          })
          .eq('id', existingRecord.id)
          .select()
          .single();
          
        if (error) throw error;
        conversationRecord = data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('will_ai_conversations')
          .insert({
            will_id,
            conversation_data,
            extracted_entities: extractedEntities
          })
          .select()
          .single();
          
        if (error) throw error;
        conversationRecord = data;
      }
    } else {
      // Create a new will record first
      const { data: willData, error: willError } = await supabase
        .from('wills')
        .insert({
          user_id,
          title: extractedEntities.fullName ? `Will of ${extractedEntities.fullName}` : 'New Will',
          status: 'draft',
          template_type: 'traditional',
          ai_generated: true
        })
        .select()
        .single();
        
      if (willError) throw willError;
      
      // Now create the conversation record
      const { data, error } = await supabase
        .from('will_ai_conversations')
        .insert({
          will_id: willData.id,
          conversation_data,
          extracted_entities: extractedEntities
        })
        .select()
        .single();
        
      if (error) throw error;
      conversationRecord = data;
      
      // If we have contacts extracted, store them
      if (extractedEntities.contacts && extractedEntities.contacts.length > 0) {
        const contactsToInsert = extractedEntities.contacts.map(contact => ({
          will_id: willData.id,
          name: contact.name,
          role: contact.role,
          email: contact.email || '',
          phone: contact.phone || '',
          address: contact.address || ''
        }));
        
        const { error: contactsError } = await supabase
          .from('will_contacts')
          .insert(contactsToInsert);
          
        if (contactsError) {
          console.error("Error inserting contacts:", contactsError);
          // Continue even if contacts insertion fails
        }
      }
    }
    
    // Return the conversation record
    return new Response(JSON.stringify({
      conversation_record: conversationRecord,
      extracted_entities: extractedEntities
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Error in save-will-conversation function:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error: " + error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// Function to extract entities from conversation
function extractEntitiesFromConversation(conversation: any[]): Record<string, any> {
  const entities: Record<string, any> = {
    fullName: null,
    maritalStatus: null,
    spouseName: null,
    children: [],
    executorName: null,
    alternateExecutorName: null,
    guardianName: null,
    assets: [],
    contacts: []
  };
  
  // Find user messages in the conversation
  const userMessages = conversation
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content);
    
  // Find assistant messages in the conversation
  const assistantMessages = conversation
    .filter(msg => msg.role === 'assistant')
    .map(msg => msg.content);
  
  // Extract full name
  userMessages.forEach(message => {
    if (!entities.fullName) {
      const nameMatch = message.match(/(?:my name is|I am|I'm) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
      if (nameMatch && nameMatch[1]) {
        entities.fullName = nameMatch[1];
      }
    }
    
    // Extract marital status
    if (!entities.maritalStatus) {
      if (message.match(/\b(?:I am|I'm) single\b/i)) {
        entities.maritalStatus = "Single";
      } else if (message.match(/\b(?:I am|I'm) married\b/i)) {
        entities.maritalStatus = "Married";
        
        // If married, try to extract spouse name
        const spouseMatch = message.match(/\bto ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
        if (spouseMatch && spouseMatch[1]) {
          entities.spouseName = spouseMatch[1];
        }
      } else if (message.match(/\b(?:I am|I'm) divorced\b/i)) {
        entities.maritalStatus = "Divorced";
      } else if (message.match(/\b(?:I am|I'm) widowed\b/i)) {
        entities.maritalStatus = "Widowed";
      }
    }
    
    // Extract executor
    if (!entities.executorName) {
      const executorMatch = message.match(/(?:executor|trustee)(?:'s| is| should be| will be) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
      if (executorMatch && executorMatch[1]) {
        entities.executorName = executorMatch[1];
        
        // Add to contacts
        entities.contacts.push({
          name: executorMatch[1],
          role: "Executor",
          email: "",
          phone: "",
          address: ""
        });
      }
    }
    
    // Extract alternate executor
    if (!entities.alternateExecutorName) {
      const altExecutorMatch = message.match(/(?:alternate executor|backup executor|if .* cannot) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
      if (altExecutorMatch && altExecutorMatch[1]) {
        entities.alternateExecutorName = altExecutorMatch[1];
        
        // Add to contacts
        entities.contacts.push({
          name: altExecutorMatch[1],
          role: "Alternate Executor",
          email: "",
          phone: "",
          address: ""
        });
      }
    }
    
    // Extract guardian for children
    if (!entities.guardianName) {
      const guardianMatch = message.match(/(?:guardian|take care of (?:my|the) (?:child|children)) (?:is|should be|will be) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
      if (guardianMatch && guardianMatch[1]) {
        entities.guardianName = guardianMatch[1];
        
        // Add to contacts
        entities.contacts.push({
          name: guardianMatch[1],
          role: "Guardian",
          email: "",
          phone: "",
          address: ""
        });
      }
    }
  });
  
  // Look for potential names mentioned in assistant messages
  // (This helps with confirmation messages like "Thank you, [Name]")
  if (!entities.fullName) {
    for (const message of assistantMessages) {
      const thankYouMatch = message.match(/Thank you,? ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/);
      if (thankYouMatch && thankYouMatch[1]) {
        entities.fullName = thankYouMatch[1];
        break;
      }
    }
  }
  
  return entities;
}
