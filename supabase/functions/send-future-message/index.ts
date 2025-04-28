
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { Resend } from 'https://esm.sh/resend@1.1.0';

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

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
    console.log('Starting message delivery process');
    const { messageId } = await req.json();
    
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    // Fetch message details
    const { data: message, error: fetchError } = await supabase
      .from('future_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      console.error('Error fetching message:', fetchError);
      throw new Error('Message not found');
    }

    // Update status to processing
    const { error: updateError } = await supabase
      .from('future_messages')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (updateError) {
      console.error('Error updating status:', updateError);
      throw new Error('Failed to update message status');
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'TheTank <messages@willtank.ai>',
      to: [message.recipient_email],
      subject: message.title || 'A message from The Tank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>${message.title || 'A message from The Tank'}</h1>
          <p>Dear ${message.recipient_name},</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            ${message.content || message.preview || 'No content available'}
          </div>
          ${message.message_url ? `
            <div style="margin: 20px 0;">
              <a href="${message.message_url}" 
                 style="background-color: #4F46E5; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px;">
                View Attachment
              </a>
            </div>
          ` : ''}
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This message was delivered by The Tank, a digital time capsule service.
          </p>
        </div>
      `,
    });

    if (!emailResponse) {
      throw new Error('Failed to send email');
    }

    // Log email notification
    await supabase
      .from('email_notifications')
      .insert({
        message_id: messageId,
        user_id: message.user_id,
        recipient_email: message.recipient_email,
        subject: message.title,
        content: message.content || message.preview,
        status: 'sent'
      });

    // Update message status to delivered
    const { error: deliveredError } = await supabase
      .from('future_messages')
      .update({ 
        status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (deliveredError) {
      console.error('Error marking as delivered:', deliveredError);
      throw new Error('Failed to update delivery status');
    }

    // Create success notification for the sender
    await supabase
      .from('notifications')
      .insert({
        user_id: message.user_id,
        title: 'Message Delivered',
        description: `Your message "${message.title}" has been delivered to ${message.recipient_name}.`,
        type: 'message_delivered'
      });

    return new Response(
      JSON.stringify({ success: true, messageId, status: 'delivered' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in send-future-message:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
