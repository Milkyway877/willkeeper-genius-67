import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { getResendClient, buildDefaultEmailLayout, isEmailSendSuccess, formatResendError } from '../_shared/email-helper.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting message delivery process');
    const { messageId } = await req.json();
    
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    const { data: message, error: fetchError } = await supabase
      .from('future_messages')
      .select('*, user_profiles(full_name)')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      console.error('Error fetching message:', fetchError);
      throw new Error('Message not found');
    }

    const senderName = message.user_profiles?.full_name || 'Someone special';

    console.log('Message details:', JSON.stringify(message, null, 2));

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

    console.log('Preparing to send email to:', message.recipient_email);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not set in environment variables');
      throw new Error('Email service configuration error: API key not set');
    }

    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">${message.title || 'A special message for you'}</h1>
        <p style="font-size: 16px;">Dear ${message.recipient_name},</p>
        <p style="font-size: 16px; color: #4B5563; margin-bottom: 20px;">
          This message was left for you by ${senderName}.
        </p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px; font-size: 16px; line-height: 1.6;">
          ${message.content || message.preview || 'No content available'}
        </div>
    `;

    let attachmentUrl = null;
    if (message.message_url) {
      try {
        if (message.message_type === 'video') {
          const { data: publicUrl } = await supabase
            .storage
            .from('future-videos')
            .getPublicUrl(message.message_url);
          
          console.log('Video public URL:', publicUrl.publicUrl);
          attachmentUrl = publicUrl.publicUrl;
        } else if (message.message_type === 'audio') {
          const { data: publicUrl } = await supabase
            .storage
            .from('future-videos')
            .getPublicUrl(message.message_url);
          
          console.log('Audio public URL:', publicUrl.publicUrl);
          attachmentUrl = publicUrl.publicUrl;
        } else {
          const { data: publicUrl } = await supabase
            .storage
            .from('future-attachments')
            .getPublicUrl(message.message_url);
          
          attachmentUrl = publicUrl.publicUrl;
        }
        
        if (attachmentUrl) {
          emailContent += `
            <div style="margin: 20px 0;">
              <p style="margin-bottom: 10px;">Click the button below to access your ${message.message_type} message:</p>
              <a href="${attachmentUrl}" 
                style="background-color: #4F46E5; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View ${message.message_type.charAt(0).toUpperCase() + message.message_type.slice(1)}
              </a>
            </div>
          `;
        }
      } catch (attachmentError) {
        console.error('Error generating attachment URL:', attachmentError);
      }
    }
    
    emailContent += `
        <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          This message was delivered by WillTank, a digital time capsule service.
        </p>
        <p style="color: #666; font-size: 12px;">
          If you have any questions, please contact support@willtank.com
        </p>
      </div>
    `;

    const fullEmailContent = buildDefaultEmailLayout(emailContent);

    console.log('Sending email via Resend...');
    let emailSent = false;
    let emailError = null;
    let emailResponse = null;
    
    try {
      const resend = getResendClient();
      
      console.log('Email parameters:', {
        from: 'WillTank <support@willtank.com>',
        to: message.recipient_email,
        subject: `A message from ${senderName} via WillTank`
      });
      
      emailResponse = await resend.emails.send({
        from: 'WillTank <support@willtank.com>',
        to: [message.recipient_email],
        subject: `A message from ${senderName} via WillTank`,
        html: fullEmailContent,
      });

      console.log('Email sending raw response:', JSON.stringify(emailResponse));
      
      emailSent = isEmailSendSuccess(emailResponse);
      
      if (emailSent) {
        console.log('Email successfully sent with ID:', emailResponse.id);
      } else {
        emailError = formatResendError(emailResponse);
        console.error('Email sending failed:', emailError);
      }
    } catch (sendError) {
      emailSent = false;
      emailError = sendError.message || 'Exception sending email';
      console.error('Exception sending email:', sendError);
    }

    const { data: notificationData, error: notificationError } = await supabase
      .from('email_notifications')
      .insert({
        message_id: messageId,
        user_id: message.user_id,
        recipient_email: message.recipient_email,
        subject: message.title,
        content: message.content || message.preview,
        status: emailSent ? 'sent' : 'failed',
        error: emailError
      });
      
    if (notificationError) {
      console.error('Error logging email notification:', notificationError);
    } else {
      console.log('Email notification logged successfully');
    }

    const finalStatus = emailSent ? 'delivered' : 'failed';
    const { error: statusUpdateError } = await supabase
      .from('future_messages')
      .update({ 
        status: finalStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (statusUpdateError) {
      console.error('Error updating final status:', statusUpdateError);
    } else {
      console.log(`Message marked as ${finalStatus}`);
    }

    return new Response(
      JSON.stringify({ 
        success: emailSent,
        messageId, 
        status: finalStatus,
        emailSent,
        recipientEmail: message.recipient_email,
        emailResponse,
        error: emailError
      }),
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
