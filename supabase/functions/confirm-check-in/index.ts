
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { getResendClient, buildDefaultEmailLayout } from '../_shared/email-helper.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate next check-in date based on frequency
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get the message ID from the URL query parameters
  const url = new URL(req.url);
  const messageId = url.searchParams.get('id');
  
  if (!messageId) {
    return new Response(
      buildDefaultEmailLayout(`
        <div style="text-align: center; padding: 40px 20px;">
          <h1 style="color: #e11d48;">Error</h1>
          <p style="font-size: 18px;">Missing message ID. Unable to process check-in.</p>
          <p style="margin-top: 30px;">
            <a href="${supabaseUrl}" style="color: #4F46E5; text-decoration: none;">Return to WillTank</a>
          </p>
        </div>
      `),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );
  }

  try {
    // Get the current message details
    const { data: message, error: fetchError } = await supabase
      .from('future_messages')
      .select('*')
      .eq('id', messageId)
      .single();
      
    if (fetchError || !message) {
      console.error('Error fetching check-in message:', fetchError);
      return new Response(
        buildDefaultEmailLayout(`
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #e11d48;">Error</h1>
            <p style="font-size: 18px;">Message not found or has been deleted.</p>
            <p style="margin-top: 30px;">
              <a href="${supabaseUrl}" style="color: #4F46E5; text-decoration: none;">Return to WillTank</a>
            </p>
          </div>
        `),
        { 
          status: 404,
          headers: { 
            'Content-Type': 'text/html',
            ...corsHeaders 
          }
        }
      );
    }
    
    if (message.message_type !== 'check-in') {
      console.error('Not a check-in message');
      return new Response(
        buildDefaultEmailLayout(`
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #e11d48;">Error</h1>
            <p style="font-size: 18px;">This is not a check-in message.</p>
            <p style="margin-top: 30px;">
              <a href="${supabaseUrl}" style="color: #4F46E5; text-decoration: none;">Return to WillTank</a>
            </p>
          </div>
        `),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'text/html',
            ...corsHeaders 
          }
        }
      );
    }
    
    // Calculate the next check-in date based on frequency
    if (!message.frequency) {
      console.error('Missing frequency for check-in message');
      return new Response(
        buildDefaultEmailLayout(`
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #e11d48;">Error</h1>
            <p style="font-size: 18px;">Check-in configuration is incomplete.</p>
            <p style="margin-top: 30px;">
              <a href="${supabaseUrl}" style="color: #4F46E5; text-decoration: none;">Return to WillTank</a>
            </p>
          </div>
        `),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'text/html',
            ...corsHeaders 
          }
        }
      );
    }
    
    const nextCheckInDate = getNextCheckInDate(new Date(), message.frequency);
    
    // Update the message with the new delivery date
    const { error: updateError } = await supabase
      .from('future_messages')
      .update({ 
        delivery_date: nextCheckInDate.toISOString(),
        status: 'scheduled',
        updated_at: new Date().toISOString(),
        last_check_in_response: new Date().toISOString()
      })
      .eq('id', messageId);
      
    if (updateError) {
      console.error('Error scheduling next check-in:', updateError);
      return new Response(
        buildDefaultEmailLayout(`
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #e11d48;">Error</h1>
            <p style="font-size: 18px;">Failed to process your check-in. Please try again later.</p>
            <p style="margin-top: 30px;">
              <a href="${supabaseUrl}" style="color: #4F46E5; text-decoration: none;">Return to WillTank</a>
            </p>
          </div>
        `),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'text/html',
            ...corsHeaders 
          }
        }
      );
    }
    
    // Create a notification for the user
    await supabase
      .from('notifications')
      .insert({
        user_id: message.user_id,
        type: 'check_in_completed',
        title: 'Check-In Confirmed',
        description: `You've successfully confirmed your well-being. Your next check-in is scheduled for ${nextCheckInDate.toLocaleDateString()}.`,
        metadata: {
          messageId: message.id,
          nextCheckIn: nextCheckInDate.toISOString()
        }
      });
    
    console.log(`Check-in confirmed. Next check-in scheduled for ${nextCheckInDate.toISOString()}`);
    
    // Return success page
    return new Response(
      buildDefaultEmailLayout(`
        <div style="text-align: center; padding: 40px 20px;">
          <h1 style="color: #10B981;">Check-In Confirmed</h1>
          <p style="font-size: 18px;">Thank you for confirming your well-being!</p>
          <p style="color: #4B5563; margin: 20px 0;">
            Your response has been recorded. Your next check-in is scheduled for 
            <strong>${nextCheckInDate.toLocaleDateString()}</strong>.
          </p>
          <p style="margin-top: 30px;">
            <a href="${supabaseUrl}" style="color: #4F46E5; text-decoration: none;">Return to WillTank</a>
          </p>
        </div>
      `),
      { 
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );
  } catch (error) {
    console.error('Error processing check-in confirmation:', error);
    
    return new Response(
      buildDefaultEmailLayout(`
        <div style="text-align: center; padding: 40px 20px;">
          <h1 style="color: #e11d48;">Error</h1>
          <p style="font-size: 18px;">An unexpected error occurred. Please try again later.</p>
          <p style="margin-top: 30px;">
            <a href="${supabaseUrl}" style="color: #4F46E5; text-decoration: none;">Return to WillTank</a>
          </p>
        </div>
      `),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders 
        }
      }
    );
  }
});
