
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

    // Log message for debugging
    console.log('Message details:', JSON.stringify(message, null, 2));

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

    console.log('Preparing to send email to:', message.recipient_email);

    // Construct email content
    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>${message.title || 'A message from The Tank'}</h1>
        <p>Dear ${message.recipient_name},</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          ${message.content || message.preview || 'No content available'}
        </div>
    `;

    // Add attachment link if available
    let attachmentUrl = null;
    if (message.message_url) {
      try {
        if (message.message_type === 'video') {
          // Generate full URL for video files
          const { data: publicUrl } = await supabase
            .storage
            .from('future-videos')
            .getPublicUrl(message.message_url);
          
          console.log('Video public URL:', publicUrl.publicUrl);
          attachmentUrl = publicUrl.publicUrl;
        } else {
          // For other attachments
          const { data: publicUrl } = await supabase
            .storage
            .from('future-attachments')
            .getPublicUrl(message.message_url);
          
          attachmentUrl = publicUrl.publicUrl;
        }
        
        if (attachmentUrl) {
          emailContent += `
            <div style="margin: 20px 0;">
              <a href="${attachmentUrl}" 
                style="background-color: #4F46E5; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                View Attachment
              </a>
            </div>
          `;
        }
      } catch (attachmentError) {
        console.error('Error generating attachment URL:', attachmentError);
      }
    }
    
    // Add footer
    emailContent += `
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This message was delivered by The Tank, a digital time capsule service.
        </p>
      </div>
    `;

    // Wrap email in default layout
    const fullEmailContent = buildDefaultEmailLayout(emailContent);

    // Send email using Resend
    console.log('Sending email via Resend...');
    let emailSent = false;
    let emailError = null;
    
    try {
      const resend = getResendClient();
      const emailResponse = await resend.emails.send({
        from: 'The Tank <tank@willtank.ai>', // Make sure this domain is verified in Resend
        to: [message.recipient_email],
        subject: message.title || 'A message from The Tank',
        html: fullEmailContent,
      });

      console.log('Email sending response:', JSON.stringify(emailResponse));
      
      if (emailResponse && !emailResponse.error) {
        emailSent = true;
      } else {
        emailError = emailResponse.error || 'Unknown error sending email';
        console.error('Email sending failed:', emailError);
      }
    } catch (sendError) {
      emailError = sendError.message || 'Exception sending email';
      console.error('Exception sending email:', sendError);
    }

    // Log email notification in database regardless of email success
    // This is for tracking purposes
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
      // Continue execution even if notification logging fails
    } else {
      console.log('Email notification logged successfully');
    }

    // Update message status based on email success/failure
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
