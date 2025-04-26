
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking for scheduled messages to deliver...');
    
    // Get current date in ISO format
    const now = new Date().toISOString();
    
    // Find messages scheduled for delivery that haven't been delivered yet
    const { data: messages, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('status', 'scheduled')
      .eq('delivery_type', 'date')
      .lte('delivery_date', now);
      
    if (error) {
      throw new Error(`Failed to fetch scheduled messages: ${error.message}`);
    }
    
    console.log(`Found ${messages?.length || 0} messages to deliver`);
    
    // Process each message for delivery
    const deliveryResults = await Promise.all(
      (messages || []).map(async (message) => {
        try {
          // Call the send-future-message function for each message
          const response = await fetch(`${supabaseUrl}/functions/v1/send-future-message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ messageId: message.id })
          });
          
          const result = await response.json();
          return {
            messageId: message.id,
            success: result.success,
            error: result.error
          };
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err);
          return {
            messageId: message.id,
            success: false,
            error: err.message
          };
        }
      })
    );
    
    // Count successful and failed deliveries
    const successful = deliveryResults.filter(r => r.success).length;
    const failed = deliveryResults.filter(r => !r.success).length;
    
    console.log(`Delivery results: ${successful} succeeded, ${failed} failed`);
    
    return new Response(
      JSON.stringify({
        processed: deliveryResults.length,
        successful,
        failed,
        results: deliveryResults
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in check-scheduled-messages function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
