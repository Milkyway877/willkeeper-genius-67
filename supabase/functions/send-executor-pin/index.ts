
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { 
  getResendClient, 
  buildDefaultEmailLayout, 
  isEmailSendSuccess, 
  formatResendError 
} from "../_shared/email-helper.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  generateExecutorPinEmailTemplate,
  generatePlainTextExecutorPinEmail
} from "../_shared/email-templates.ts";

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the contact and pin details
    const {
      contactId,
      contactName,
      contactEmail,
      executorEmail,
      executorName,
      deceasedName,
      pin
    } = await req.json();
    
    if (!contactEmail || !pin || !deceasedName || !executorEmail) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Sending PIN code to trusted contact ${contactName} for executor verification`);
    
    // Get resend client to send the email
    const resend = getResendClient();
    
    // Generate email content
    const htmlContent = generateExecutorPinEmailTemplate(
      contactName,
      deceasedName,
      executorName,
      pin
    );
    
    const textContent = generatePlainTextExecutorPinEmail(
      contactName,
      deceasedName,
      executorName,
      pin
    );
    
    // Send the email
    const emailResponse = await resend.emails.send({
      from: "WillTank <notifications@willtank.com>",
      to: [contactEmail],
      subject: `Urgent: Executor Verification PIN for ${deceasedName}'s Will`,
      html: buildDefaultEmailLayout(htmlContent),
      text: textContent,
      headers: { 
        "X-Priority": "1",
        "Importance": "high" 
      },
      tags: [
        {
          name: 'type',
          value: 'executor_pin'
        },
        {
          name: 'priority',
          value: 'high'
        }
      ]
    });
    
    if (!isEmailSendSuccess(emailResponse)) {
      const errorMessage = formatResendError(emailResponse);
      console.error('Error sending PIN email:', errorMessage);
      
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send PIN email", error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('PIN email sent successfully:', emailResponse.id);
    
    // Log the email event
    await supabase.from('death_verification_logs').insert({
      user_id: '', // We don't have the user ID here but we have the contact ID
      action: 'executor_pin_sent',
      details: {
        contact_id: contactId,
        contact_name: contactName,
        executor_email: executorEmail,
        deceased_name: deceasedName,
        email_id: emailResponse.id,
      }
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "PIN email sent successfully",
        emailId: emailResponse.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending PIN email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Failed to process PIN email",
        error: error.message || "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
