
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { 
  getResendClient, 
  buildDefaultEmailLayout, 
  isEmailSendSuccess, 
  formatResendError 
} from "../_shared/email-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NotificationEmailRequest {
  to: string;
  subject: string;
  content: string;
  userId?: string;
  priority?: 'normal' | 'high';
  contentType?: 'notification' | 'verification' | 'alert';
  emailType?: string;
  checkEnv?: boolean; // New flag to check environment variables
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData = await req.json() as NotificationEmailRequest;
    
    // Special case: Check environment variables
    if (requestData.checkEnv) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      const envCheck = {
        RESEND_API_KEY: !!resendApiKey,
        SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey
      };
      
      console.log("Environment check:", envCheck);
      
      return new Response(
        JSON.stringify({ 
          success: envCheck.RESEND_API_KEY && envCheck.SUPABASE_URL && envCheck.SUPABASE_SERVICE_ROLE_KEY,
          envCheck
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { to, subject, content, userId, priority = 'normal', contentType = 'notification', emailType } = requestData;
    
    if (!to || !subject || !content) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, subject, or content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Preparing to send ${contentType} email to: ${to}`);
    
    // Initialize Resend client
    const resend = getResendClient();
    
    // Set sender based on content type
    let sender;
    switch (contentType) {
      case 'verification':
        sender = "WillTank Verification <verify@willtank.com>";
        break;
      case 'alert':
        sender = "WillTank Alerts <alerts@willtank.com>";
        break;
      default:
        sender = "WillTank <notifications@willtank.com>";
    }
    
    // Set priority headers if needed
    const emailOptions = priority === 'high' ? {
      headers: {
        "X-Priority": "1", 
        "Importance": "high"
      }
    } : {};
    
    // Add tracking tags
    const emailTags = [
      {
        name: 'content_type',
        value: contentType
      }
    ];
    
    if (emailType) {
      emailTags.push({
        name: 'email_type',
        value: emailType
      });
    }
    
    // Format the email content
    const formattedContent = buildDefaultEmailLayout(content);
    
    // Send the email
    console.log("Sending email...");
    const emailResponse = await resend.emails.send({
      from: sender,
      to: [to],
      subject,
      html: formattedContent,
      ...emailOptions,
      tags: emailTags
    });
    
    // Check for success
    if (!isEmailSendSuccess(emailResponse)) {
      const errorMessage = formatResendError(emailResponse);
      console.error("Email send failed:", errorMessage);
      
      // Log failure
      if (userId) {
        await supabase
          .from('notification_logs')
          .insert({
            user_id: userId,
            email: to,
            subject,
            status: 'failed',
            error: errorMessage,
            content_type: contentType
          });
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Email sent successfully with ID:", emailResponse.id);
    
    // Log success
    if (userId) {
      await supabase
        .from('notification_logs')
        .insert({
          user_id: userId,
          email: to,
          subject,
          status: 'sent',
          email_id: emailResponse.id,
          content_type: contentType
        });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in send-notification-email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
