
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

// Generate a random PIN code
function generatePinCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const willAccessEmailTemplate = (executorName: string, userName: string, pin: string, accessUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Will Access Instructions</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
    .pin-container { background-color: #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; }
    .pin { font-size: 24px; font-weight: bold; letter-spacing: 3px; }
    .button { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; }
    .steps { margin: 15px 0; }
    .step { margin-bottom: 10px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WillTank Will Access Instructions</h1>
  </div>
  <div class="content">
    <p>Hello ${executorName},</p>
    <p>${userName} has been confirmed deceased, and as their executor, you now have access to their will.</p>
    
    <div class="pin-container">
      <p>Your secure PIN code is:</p>
      <div class="pin">${pin}</div>
      <p>You will need this PIN to access the will.</p>
    </div>
    
    <h3>Steps to Access the Will:</h3>
    <div class="steps">
      <div class="step">1. Visit the WillTank website at <a href="${accessUrl}">${accessUrl}</a></div>
      <div class="step">2. Click on "Access a Will" in the navigation menu</div>
      <div class="step">3. Enter the deceased person's email address</div>
      <div class="step">4. Enter the PIN code shown above</div>
      <div class="step">5. Follow the on-screen instructions to view and manage the will</div>
    </div>
    
    <p>This PIN is confidential and should not be shared with unauthorized individuals.</p>
    <p style="text-align: center;">
      <a href="${accessUrl}" class="button">Access Will Now</a>
    </p>
  </div>
  <div class="footer">
    <p>© 2025 WillTank. All rights reserved.</p>
    <p>This email was sent as part of the WillTank deceased user will access process.</p>
  </div>
</body>
</html>
`;

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
    
    const { userId, deceased, executorName } = await req.json();
    
    if (!userId || deceased !== true) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters or user not confirmed deceased" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Get user details
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    
    if (userError) {
      console.error("Error fetching user profile:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user details" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Fetch all confirmed executors for this user
    const { data: executors, error: executorsError } = await supabase
      .from("executors")
      .select("email, name")
      .eq("user_id", userId)
      .eq("status", "confirmed");
    
    if (executorsError) {
      console.error("Error fetching executors:", executorsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch executors" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (!executors || executors.length === 0) {
      return new Response(
        JSON.stringify({ error: "No confirmed executors found for this user" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Generate a unique 10-digit PIN for will access
    const pin = generatePinCode();
    
    // Store the PIN in the database
    // Note: In a production system, this should be stored securely, possibly with encryption and expiration
    const { error: pinError } = await supabase
      .from("death_verification_pins")
      .insert({
        person_id: userId,
        pin_code: pin,
        person_type: "executor"
      });
    
    if (pinError) {
      console.error("Error storing PIN:", pinError);
      return new Response(
        JSON.stringify({ error: "Failed to store access PIN" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create the will access URL
    const appUrl = supabaseUrl.replace(".supabase.co", ".app");
    const accessUrl = `${appUrl}/access-will`;
    
    // Send email to all confirmed executors
    const displayUserName = userProfile.full_name || "the user";
    const emailPromises = executors.map(async (executor) => {
      const displayExecutorName = executor.name || executor.email;
      
      const emailResponse = await resend.emails.send({
        from: "WillTank <noreply@willtank.app>",
        to: executor.email,
        subject: `WillTank: Will Access Instructions for ${displayUserName}`,
        html: willAccessEmailTemplate(displayExecutorName, displayUserName, pin, accessUrl)
      });
      
      console.log(`Will access email sent to executor ${executor.email}:`, emailResponse);
      return emailResponse;
    });
    
    await Promise.all(emailPromises);
    
    // Create a log entry
    await supabase
      .from("activity_logs")
      .insert({
        user_id: userId,
        action: "will_access_emails_sent",
      });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Will access emails sent to ${executors.length} executor(s)`,
        pin: pin // In a production environment, consider not returning the PIN in the response
      }),
      {
        status: 200,
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
