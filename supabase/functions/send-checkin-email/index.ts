
import { serve } from "https://deno.land/std@0.132.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import { Resend } from 'npm:resend@1.0.0';

// Initialize Resend with your API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

// Create a Supabase client with the service role key for admin operations
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Email templates
const checkinReminderTemplate = (name: string, checkInUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Check-in Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
    .button { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WillTank Check-in</h1>
  </div>
  <div class="content">
    <p>Hello ${name},</p>
    <p>Hope you're doing well! This is your regular check-in reminder from WillTank.</p>
    <p>Please confirm your status by clicking the button below:</p>
    <p style="text-align: center;">
      <a href="${checkInUrl}" class="button">I'm Alive</a>
    </p>
    <p>If you don't respond within 7 days, our system will contact your beneficiaries and executors as part of our death verification process.</p>
  </div>
  <div class="footer">
    <p>© 2025 WillTank. All rights reserved.</p>
    <p>This email was sent as part of your Death Verification settings.</p>
  </div>
</body>
</html>
`;

const verificationRequestTemplate = (name: string, userName: string, responseUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Death Verification Request</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
    .button-container { text-align: center; margin: 20px 0; }
    .button { display: inline-block; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 0 10px; }
    .alive { background-color: #4f46e5; }
    .deceased { background-color: #8B0000; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WillTank Death Verification</h1>
  </div>
  <div class="content">
    <p>Hello ${name},</p>
    <p>We at WillTank are checking on the status of ${userName}, as they have not responded to their regular check-ins.</p>
    <p>As a beneficiary or executor, please confirm if ${userName} is still with us:</p>
    <div class="button-container">
      <a href="${responseUrl}&response=alive" class="button alive">Confirm Alive</a>
      <a href="${responseUrl}&response=dead" class="button deceased">Confirm Deceased</a>
    </div>
    <p>Your response is important for our secure death verification process. If you confirm the person is deceased, you will receive further instructions regarding the will access process.</p>
  </div>
  <div class="footer">
    <p>© 2025 WillTank. All rights reserved.</p>
    <p>This email was sent as part of the WillTank Death Verification System.</p>
  </div>
</body>
</html>
`;

// Function to send check-in reminder email
async function sendCheckinReminder(userId: string, email: string, name: string) {
  try {
    const checkInUrl = `${supabaseUrl.replace(".supabase.co", ".app")}/dashboard?checkin=true`;
    
    const emailResponse = await resend.emails.send({
      from: "WillTank <noreply@willtank.app>",
      to: email,
      subject: "WillTank Check-in: Please Confirm Your Status",
      html: checkinReminderTemplate(name, checkInUrl)
    });
    
    console.log(`Check-in reminder sent to ${email}:`, emailResponse);
    
    // Create a log entry
    await supabase
      .from("death_verification_logs")
      .insert({
        user_id: userId,
        action: "checkin_email_sent",
        details: { email, sent_at: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    
    return emailResponse;
  } catch (error) {
    console.error(`Error sending check-in reminder to ${email}:`, error);
    throw error;
  }
}

// Function to send verification request emails to beneficiaries and executors
async function sendVerificationRequests(userId: string, requestId: string) {
  try {
    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    
    if (userError) {
      console.error("Error fetching user profile:", userError);
      throw userError;
    }
    
    const userName = userProfile.full_name || "User";
    
    // Get beneficiaries
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from("will_beneficiaries")
      .select("id, beneficiary_name, email")
      .eq("user_id", userId);
    
    if (beneficiariesError) {
      console.error("Error fetching beneficiaries:", beneficiariesError);
      throw beneficiariesError;
    }
    
    // Get executors
    const { data: executors, error: executorsError } = await supabase
      .from("will_executors")
      .select("id, name, email")
      .eq("user_id", userId);
    
    if (executorsError) {
      console.error("Error fetching executors:", executorsError);
      throw executorsError;
    }
    
    const sentEmails = [];
    
    // Send emails to beneficiaries
    if (beneficiaries && beneficiaries.length > 0) {
      for (const beneficiary of beneficiaries) {
        const responseUrl = `${supabaseUrl.replace(".supabase.co", ".app")}/verification?requestId=${requestId}&responderId=${beneficiary.id}&type=beneficiary`;
        
        const emailResponse = await resend.emails.send({
          from: "WillTank <noreply@willtank.app>",
          to: beneficiary.email,
          subject: `Urgent: Please Confirm Status of ${userName}`,
          html: verificationRequestTemplate(beneficiary.beneficiary_name, userName, responseUrl)
        });
        
        console.log(`Verification request sent to beneficiary ${beneficiary.id}:`, emailResponse);
        sentEmails.push({ id: beneficiary.id, type: "beneficiary", email: beneficiary.email });
      }
    }
    
    // Send emails to executors
    if (executors && executors.length > 0) {
      for (const executor of executors) {
        const responseUrl = `${supabaseUrl.replace(".supabase.co", ".app")}/verification?requestId=${requestId}&responderId=${executor.id}&type=executor`;
        
        const emailResponse = await resend.emails.send({
          from: "WillTank <noreply@willtank.app>",
          to: executor.email,
          subject: `Urgent: Please Confirm Status of ${userName}`,
          html: verificationRequestTemplate(executor.name, userName, responseUrl)
        });
        
        console.log(`Verification request sent to executor ${executor.id}:`, emailResponse);
        sentEmails.push({ id: executor.id, type: "executor", email: executor.email });
      }
    }
    
    // Create a log entry
    await supabase
      .from("death_verification_logs")
      .insert({
        user_id: userId,
        action: "verification_emails_sent",
        details: { 
          request_id: requestId, 
          sent_at: new Date().toISOString(),
          recipients: sentEmails
        },
        timestamp: new Date().toISOString()
      });
    
    return { success: true, sent_count: sentEmails.length };
  } catch (error) {
    console.error("Error sending verification requests:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Process request based on action
    const { action, userId, email, name, requestId } = await req.json();
    
    if (action === "send_checkin") {
      if (!userId || !email || !name) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const result = await sendCheckinReminder(userId, email, name);
      
      return new Response(
        JSON.stringify({ success: true, message: "Check-in reminder sent", result }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "send_verification") {
      if (!userId || !requestId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const result = await sendVerificationRequests(userId, requestId);
      
      return new Response(
        JSON.stringify({ success: true, message: "Verification requests sent", result }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
