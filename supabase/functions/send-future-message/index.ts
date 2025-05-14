
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

// Function to create check-in email content
const createCheckInEmailContent = (message: any, checkInLink: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4F46E5;">${message.title || 'Regular Check-In'}</h1>
      <p style="font-size: 16px;">Hello ${message.recipient_name},</p>
      <p style="font-size: 16px; color: #4B5563; margin-bottom: 20px;">
        This is your scheduled check-in. Please confirm your well-being by clicking the button below:
      </p>
      <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px; font-size: 16px; line-height: 1.6;">
        ${message.content || message.preview || 'Please confirm your well-being by clicking the button below.'}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${checkInLink}" 
          style="background-color: #10B981; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          I'm Here - Confirm Well-Being
        </a>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        If you don't confirm within 24 hours, your trusted contacts may be notified.
      </p>
    </div>
  `;
};

// Function to create standard message email content
const createStandardEmailContent = (message: any, senderName: string, attachmentUrl: string | null): string => {
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
  
  emailContent += `
      <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        This message was delivered by WillTank, a digital time capsule service.
      </p>
    </div>
  `;
  
  return emailContent;
};

// Process a check-in response (this would be called by a check-in confirmation endpoint)
const scheduleNextCheckIn = async (messageId: string) => {
  try {
    // Get the current message details
    const { data: message, error: fetchError } = await supabase
      .from('future_messages')
      .select('*')
      .eq('id', messageId)
      .single();
      
    if (fetchError || !message || message.message_type !== 'check-in' || !message.frequency) {
      console.error('Error fetching check-in message or not a valid check-in:', fetchError);
      return false;
    }
    
    // Calculate the next check-in date based on frequency
    const nextCheckInDate = getNextCheckInDate(new Date(message.delivery_date), message.frequency);
    
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
      return false;
    }
    
    console.log(`Next check-in scheduled for ${nextCheckInDate.toISOString()}`);
    return true;
  } catch (error) {
    console.error('Error in scheduleNextCheckIn:', error);
    return false;
  }
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
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      console.error('Error fetching message:', fetchError);
      throw new Error('Message not found');
    }

    let senderName = 'Someone special';
    if (message.user_id) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', message.user_id)
        .single();
      
      if (userProfile && userProfile.full_name) {
        senderName = userProfile.full_name;
      }
    }

    console.log('Preparing to send email to:', message.recipient_email);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Email service configuration error: API key not set');
    }

    // Generate attachment URL if needed
    let attachmentUrl = null;
    if (message.message_url) {
      try {
        if (message.message_type === 'video' || message.message_type === 'audio') {
          const { data: publicUrl } = await supabase
            .storage
            .from('future-videos')
            .getPublicUrl(message.message_url);
          
          attachmentUrl = publicUrl.publicUrl;
        } else {
          const { data: publicUrl } = await supabase
            .storage
            .from('future-attachments')
            .getPublicUrl(message.message_url);
          
          attachmentUrl = publicUrl.publicUrl;
        }
      } catch (attachmentError) {
        console.error('Error generating attachment URL:', attachmentError);
      }
    }
    
    // Create a check-in confirmation link (in production, this would be a real endpoint)
    const checkInConfirmationLink = `${supabaseUrl}/functions/v1/confirm-check-in?id=${messageId}`;
    
    // Create either check-in or standard email content
    let emailContent;
    let emailSubject;
    
    if (message.message_type === 'check-in') {
      emailContent = createCheckInEmailContent(message, checkInConfirmationLink);
      emailSubject = `${message.title || 'Regular Check-In'} - Please Confirm`;
    } else {
      emailContent = createStandardEmailContent(message, senderName, attachmentUrl);
      emailSubject = `A message from ${senderName} via WillTank`;
    }

    const fullEmailContent = buildDefaultEmailLayout(emailContent);
    console.log('Sending email via Resend...');
    const resend = getResendClient();
    
    const emailResponse = await resend.emails.send({
      from: 'WillTank <support@willtank.com>',
      to: [message.recipient_email],
      subject: emailSubject,
      html: fullEmailContent,
    });

    const emailSent = isEmailSendSuccess(emailResponse);
    
    if (emailSent) {
      console.log('Email sent successfully with ID:', emailResponse.id);
      
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
      
      // For check-in messages, we'll mark as delivered but schedule next check-in
      // For regular messages, just mark as delivered
      if (message.message_type === 'check-in' && message.frequency) {
        // For check-ins, we need to schedule the next one
        await scheduleNextCheckIn(messageId);
      } else {
        // For standard messages, mark as delivered
        await supabase
          .from('future_messages')
          .update({ 
            status: 'delivered',
            updated_at: new Date().toISOString()
          })
          .eq('id', messageId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId,
        status: 'delivered',
        recipientEmail: message.recipient_email,
        isCheckIn: message.message_type === 'check-in'
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
