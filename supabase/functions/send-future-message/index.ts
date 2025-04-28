
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { Resend } from 'https://esm.sh/resend@1.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MessagePayload {
  messageId: string;
}

// Get email template based on message category and type
const getEmailTemplate = (message: any) => {
  // Base styling for all email templates
  const baseStyles = `
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
      padding: 20px 0; 
      white-space: pre-line;
    }
    .media-container {
      background-color: #f7f7f7;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 10px 0;
      font-weight: bold;
    }
    .footer { 
      margin-top: 30px; 
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px; 
      color: #666; 
      text-align: center;
    }
  `;
  
  // Common header and footer parts
  const header = `
    <div class="header">
      <h1>${message.title}</h1>
      <p>A message from the past, delivered to you today</p>
    </div>
    
    <p>Dear ${message.recipient_name},</p>
  `;
  
  const footer = `
    <div class="footer">
      <p>This message was scheduled for delivery using The Tank, a digital time capsule service.</p>
    </div>
  `;
  
  let contentSection = '';
  
  // Create content section based on message type
  switch (message.message_type) {
    case 'letter':
      contentSection = `
        <div class="message-content">
          ${message.content}
        </div>
      `;
      break;
    
    case 'video':
      const videoUrl = `${supabaseUrl}/storage/v1/object/public/future-videos/${message.message_url}`;
      contentSection = `
        <div class="message-content">
          ${message.content}
        </div>
        <div class="media-container">
          <p>A video message has been shared with you:</p>
          <a href="${videoUrl}" class="button">View Video Message</a>
          <p class="small">(Or copy this link: ${videoUrl})</p>
        </div>
      `;
      break;
    
    case 'audio':
      const audioUrl = `${supabaseUrl}/storage/v1/object/public/future-audio/${message.message_url}`;
      contentSection = `
        <div class="message-content">
          ${message.content}
        </div>
        <div class="media-container">
          <p>An audio message has been shared with you:</p>
          <a href="${audioUrl}" class="button">Listen to Audio Message</a>
          <p class="small">(Or copy this link: ${audioUrl})</p>
        </div>
      `;
      break;
    
    case 'document':
      const documentUrl = `${supabaseUrl}/storage/v1/object/public/future-documents/${message.message_url}`;
      contentSection = `
        <div class="message-content">
          ${message.content}
        </div>
        <div class="media-container">
          <p>A document has been shared with you:</p>
          <a href="${documentUrl}" class="button">View Document</a>
          <p class="small">(Or copy this link: ${documentUrl})</p>
        </div>
      `;
      break;
    
    default:
      contentSection = `
        <div class="message-content">
          ${message.content}
        </div>
      `;
  }
  
  // Assemble the complete HTML email
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${message.title}</title>
      <style>
        ${baseStyles}
      </style>
    </head>
    <body>
      ${header}
      ${contentSection}
      ${footer}
    </body>
    </html>
  `;
};

// Process a single message for delivery
async function processMessage(message: any) {
  try {
    console.log(`Processing message ID: ${message.id}`);
    
    // Prepare the email content
    const emailHtml = getEmailTemplate(message);
    const emailSubject = `${message.title} - A Message from The Tank`;
    
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY environment variable");
      throw new Error("Email service configuration error");
    }
    
    // Send the email using Resend
    console.log("About to send email with Resend");
    const { data, error } = await resend.emails.send({
      from: 'The Tank <messages@willtank.ai>',
      to: [message.recipient_email],
      subject: emailSubject,
      html: emailHtml,
    });
    
    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
    
    console.log('Email sent successfully:', data);
    
    // Update the message status to delivered
    const { error: updateError } = await supabase
      .from('future_messages')
      .update({ 
        status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .eq('id', message.id)
      .eq('status', 'processing'); // Only update if status is still processing
      
    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error(`Failed to update message status: ${updateError.message}`);
    }
    
    // Create a notification for the sender
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: message.user_id,
        title: 'Message Delivered',
        description: `Your message "${message.title}" has been delivered to ${message.recipient_name}.`,
        type: 'message_delivered',
      });
      
    if (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }
      
    return {
      success: true,
      messageId: message.id,
      status: 'delivered'
    };
  } catch (error) {
    console.error(`Error delivering message ${message.id}:`, error);
    
    // Update status to indicate failure
    try {
      await supabase
        .from('future_messages')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString() 
        })
        .eq('id', message.id)
        .eq('status', 'processing'); // Only update if status is still processing
    } catch (updateError) {
      console.error('Error updating message status after failure:', updateError);
    }
      
    return {
      success: false,
      messageId: message.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received message sending request');
    
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    const { messageId } = body as MessagePayload;
    
    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'Missing messageId parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Processing message ID: ${messageId}`);

    // Get the message to be delivered
    const { data: message, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error || !message) {
      console.error('Message not found:', error);
      return new Response(
        JSON.stringify({ error: error?.message || 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if the message is in the correct state for processing
    if (message.status !== 'processing') {
      console.warn(`Message ${messageId} is in ${message.status} state, not processing`);
      return new Response(
        JSON.stringify({ 
          error: `Message is in ${message.status} state, not processing`,
          status: message.status
        }),
        { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Process the message for delivery
    const result = await processMessage(message);
    
    console.log('Message processing result:', result);
    
    return new Response(
      JSON.stringify(result),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in send-future-message function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
