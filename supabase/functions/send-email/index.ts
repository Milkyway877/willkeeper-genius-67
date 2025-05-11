
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  getResendClient, 
  isEmailSendSuccess, 
  formatResendError 
} from "../_shared/email-helper.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  to: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  priority?: 'normal' | 'high';
  tags?: Array<{name: string, value: string}>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get session using the auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const { 
      to, 
      subject, 
      htmlContent, 
      textContent,
      priority = 'normal',
      tags = []
    } = await req.json() as EmailRequest;
    
    if (!to || !subject || (!htmlContent && !textContent)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: to, subject, and either htmlContent or textContent" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Sending email to: ${Array.isArray(to) ? to.join(', ') : to}`);
    
    // Initialize Resend client
    const resend = getResendClient();
    
    // Set priority headers if needed
    const emailOptions = priority === 'high' ? {
      headers: {
        "X-Priority": "1", 
        "Importance": "high"
      }
    } : {};
    
    // Send the email
    const emailResponse = await resend.emails.send({
      from: "WillTank <notifications@willtank.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html: htmlContent,
      text: textContent,
      ...emailOptions,
      tags: tags
    });
    
    // Check for success
    if (!isEmailSendSuccess(emailResponse)) {
      const errorMessage = formatResendError(emailResponse);
      console.error("Email send failed:", errorMessage);
      
      // Log failure
      await supabase
        .from('notification_logs')
        .insert({
          user_id: user.id,
          email: Array.isArray(to) ? to[0] : to,
          subject,
          status: 'failed',
          error: errorMessage,
          content_type: 'standard'
        });
      
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
    await supabase
      .from('notification_logs')
      .insert({
        user_id: user.id,
        email: Array.isArray(to) ? to[0] : to,
        subject,
        status: 'sent',
        email_id: emailResponse.id,
        content_type: 'standard'
      });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in send-email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
