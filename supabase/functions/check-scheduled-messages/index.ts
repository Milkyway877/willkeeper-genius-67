
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to check for missed check-ins and notify contacts
async function checkMissedCheckIns() {
  try {
    // Look for check-ins that were delivered but not responded to within 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: missedCheckIns, error: fetchError } = await supabase
      .from('future_messages')
      .select('*')
      .eq('message_type', 'check-in')
      .eq('status', 'delivered')
      .lt('updated_at', twentyFourHoursAgo.toISOString());
      
    if (fetchError) {
      console.error('Error fetching missed check-ins:', fetchError);
      return [];
    }
    
    if (!missedCheckIns || missedCheckIns.length === 0) {
      console.log('No missed check-ins found');
      return [];
    }
    
    console.log(`Found ${missedCheckIns.length} missed check-ins`);
    
    // Process each missed check-in
    const notificationResults = await Promise.all(
      missedCheckIns.map(async (checkIn) => {
        try {
          // Create a notification for the missed check-in
          await supabase
            .from('notifications')
            .insert({
              user_id: checkIn.user_id,
              type: 'check_in_missed',
              title: 'Check-In Missed',
              description: `You didn't respond to your scheduled check-in. Your trusted contacts may be notified if configured.`,
              metadata: {
                messageId: checkIn.id,
                missedDate: new Date().toISOString()
              }
            });
          
          // TODO: In a future update, notify trusted contacts
          // This would involve fetching trusted contacts and sending them notifications
          
          // Re-schedule the check-in
          if (checkIn.frequency) {
            const nextCheckInDate = getNextCheckInDate(new Date(), checkIn.frequency);
            
            await supabase
              .from('future_messages')
              .update({ 
                delivery_date: nextCheckInDate.toISOString(),
                status: 'scheduled',
                updated_at: new Date().toISOString()
              })
              .eq('id', checkIn.id);
              
            console.log(`Rescheduled missed check-in ${checkIn.id} for ${nextCheckInDate.toISOString()}`);
          }
          
          return {
            checkInId: checkIn.id,
            success: true
          };
        } catch (err) {
          console.error(`Error processing missed check-in ${checkIn.id}:`, err);
          return {
            checkInId: checkIn.id,
            success: false,
            error: err.message
          };
        }
      })
    );
    
    return notificationResults;
  } catch (error) {
    console.error('Error in checkMissedCheckIns:', error);
    return [];
  }
}

// Function to calculate next check-in date based on frequency
const getNextCheckInDate = (currentDate: Date, frequency: string): Date => {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      // Default to monthly if frequency not recognized
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
};

// Function to process messages in batches to avoid overloading
async function processMessageBatch(messages: any[]) {
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (message) => {
        try {
          // Mark the message as processing to prevent duplicate delivery
          await supabase
            .from('future_messages')
            .update({ status: 'processing' })
            .eq('id', message.id);
          
          // Call the send-future-message function for each message
          const response = await fetch(`${supabaseUrl}/functions/v1/send-future-message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ messageId: message.id })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Delivery function returned error: ${errorData.error || response.statusText}`);
          }
          
          const result = await response.json();
          
          // Log successful delivery
          console.log(`Message ${message.id} delivered successfully`);
          
          return {
            messageId: message.id,
            success: true,
            recipient: message.recipient_email,
            messageType: message.message_type,
            isCheckIn: message.message_type === 'check-in'
          };
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err);
          
          // Reset status if delivery failed
          await supabase
            .from('future_messages')
            .update({ 
              status: 'scheduled',
              updated_at: new Date().toISOString()
            })
            .eq('id', message.id);
            
          return {
            messageId: message.id,
            success: false,
            error: err.message,
            recipient: message.recipient_email,
            messageType: message.message_type,
            isCheckIn: message.message_type === 'check-in'
          };
        }
      })
    );
    
    results.push(...batchResults);
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < messages.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Function to handle retries for previously failed messages
async function retryFailedMessages() {
  const retryWindow = new Date();
  retryWindow.setHours(retryWindow.getHours() - 24); // Only retry messages that failed within the last 24 hours
  
  const { data: failedMessages, error } = await supabase
    .from('future_messages')
    .select('*')
    .eq('status', 'failed')
    .gte('updated_at', retryWindow.toISOString())
    .order('delivery_date', { ascending: true });
    
  if (error || !failedMessages || failedMessages.length === 0) {
    return [];
  }
  
  console.log(`Found ${failedMessages.length} failed messages to retry`);
  return await processMessageBatch(failedMessages);
}

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
      .lte('delivery_date', now)
      .order('delivery_date', { ascending: true });
      
    if (error) {
      throw new Error(`Failed to fetch scheduled messages: ${error.message}`);
    }
    
    console.log(`Found ${messages?.length || 0} new messages to deliver`);
    
    // Process new scheduled messages
    const newDeliveryResults = messages && messages.length > 0 
      ? await processMessageBatch(messages)
      : [];
      
    // Check for missed check-ins
    const missedCheckInResults = await checkMissedCheckIns();
    
    // Retry previously failed messages
    const retryResults = await retryFailedMessages();
    
    // Combine all results
    const deliveryResults = [...newDeliveryResults, ...retryResults];
    
    // Count successful and failed deliveries
    const successful = deliveryResults.filter(r => r.success).length;
    const failed = deliveryResults.filter(r => !r.success).length;
    const checkInsMissed = missedCheckInResults.length;
    
    console.log(`Delivery summary: ${successful} succeeded, ${failed} failed, ${checkInsMissed} missed check-ins`);
    
    // Log detailed results for debugging
    if (successful > 0) {
      console.log('Successfully delivered messages:', 
        deliveryResults.filter(r => r.success).map(r => r.messageId));
    }
    
    if (failed > 0) {
      console.log('Failed messages:', 
        deliveryResults.filter(r => !r.success).map(r => ({ id: r.messageId, error: r.error })));
    }
    
    return new Response(
      JSON.stringify({
        processed: deliveryResults.length,
        successful,
        failed,
        missedCheckIns: checkInsMissed,
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
