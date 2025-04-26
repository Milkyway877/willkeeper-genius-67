
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MessagePayload {
  messageId: string;
}

// Email templates based on message category
const getEmailTemplate = (message: any) => {
  const baseHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${message.title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .message-content { 
          white-space: pre-line;
          padding: 20px 0; 
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 12px; 
          color: #666; 
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${message.title}</h1>
        <p>A message from the past, delivered to you today</p>
      </div>
      
      <p>Dear ${message.recipient_name},</p>
      
      <div class="message-content">
        ${message.content}
      </div>
      
      <div class="footer">
        <p>This message was scheduled for delivery using The Tank, a digital time capsule service.</p>
      </div>
    </body>
    </html>
  `;
  
  return baseHtml;
};

// Process a single message for delivery
async function processMessage(message: any) {
  try {
    console.log(`Processing message ID: ${message.id}`);
    
    // Prepare the email content
    const emailHtml = getEmailTemplate(message);
    const emailSubject = `${message.title} - A Message from The Tank`;
    
    // Send the email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'The Tank <messages@example.com>',
        to: [message.recipient_email],
        subject: emailSubject,
        html: emailHtml,
      })
    });
    
    const responseData = await response.json();
    console.log('Email service response:', responseData);
    
    if (response.ok) {
      // Update the message status to delivered
      const { error: updateError } = await supabase
        .from('future_messages')
        .update({ 
          status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', message.id);
        
      if (updateError) {
        throw new Error(`Failed to update message status: ${updateError.message}`);
      }
      
      // Create a notification for the sender
      await supabase
        .from('notifications')
        .insert({
          user_id: message.user_id,
          title: 'Message Delivered',
          description: `Your message "${message.title}" has been delivered to ${message.recipient_name}.`,
          type: 'message_delivered',
        });
        
      return {
        success: true,
        messageId: message.id,
        status: 'delivered'
      };
    } else {
      throw new Error(`Email delivery failed: ${responseData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Error delivering message ${message.id}:`, error);
    
    // Update status to indicate failure
    await supabase
      .from('future_messages')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', message.id);
      
    return {
      success: false,
      messageId: message.id,
      error: error.message
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId } = await req.json() as MessagePayload;

    // Get the message to be delivered
    const { data: message, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error || !message) {
      throw new Error(`Message not found: ${error?.message || 'Unknown error'}`);
    }

    // Process the message for delivery
    const result = await processMessage(message);
    
    return new Response(
      JSON.stringify(result),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in send-future-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
