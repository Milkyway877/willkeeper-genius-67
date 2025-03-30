
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

const confirmationEmailTemplate = (name: string, type: string, confirmUrl: string, declineUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm Your Role</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
    .button { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; }
    .button.decline { background-color: #ef4444; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WillTank Role Confirmation</h1>
  </div>
  <div class="content">
    <p>Hello ${name},</p>
    <p>You have been designated as a <strong>${type}</strong> in someone's will on WillTank.</p>
    <p>Please confirm your acceptance of this role:</p>
    <p style="text-align: center;">
      <a href="${confirmUrl}" class="button">Confirm Role</a>
      <a href="${declineUrl}" class="button decline">Decline Role</a>
    </p>
    <p>If you confirm, you will receive periodic check-in requests and, if necessary, instructions for accessing the will.</p>
  </div>
  <div class="footer">
    <p>© 2025 WillTank. All rights reserved.</p>
    <p>This email was sent as part of the WillTank role assignment process.</p>
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
    
    const { userId, email, name, type } = await req.json();
    
    if (!userId || !email || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: userId, email, and type are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Generate a unique confirmation token
    const token = crypto.randomUUID();
    const table = type === "executor" ? "executors" : "beneficiaries";
    
    // Insert the new executor or beneficiary with the confirmation token
    const { data, error } = await supabase
      .from(table)
      .insert([{
        user_id: userId,
        email,
        confirmation_token: token
      }]);
    
    if (error) {
      console.error(`Error inserting ${type}:`, error);
      return new Response(
        JSON.stringify({ error: `Failed to create ${type}: ${error.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create confirmation URLs
    const appUrl = supabaseUrl.replace(".supabase.co", ".app");
    const confirmUrl = `${appUrl}/confirm?token=${token}&type=${type}`;
    const declineUrl = `${appUrl}/decline?token=${token}&type=${type}`;
    
    // Send the confirmation email
    const displayName = name || email;
    const typeDisplay = type === "executor" ? "Executor" : "Beneficiary";
    
    const emailResponse = await resend.emails.send({
      from: "WillTank <noreply@willtank.app>",
      to: email,
      subject: `WillTank: Confirm Your Role as ${typeDisplay}`,
      html: confirmationEmailTemplate(displayName, typeDisplay, confirmUrl, declineUrl)
    });
    
    console.log(`Confirmation email sent to ${email} for ${type} role:`, emailResponse);
    
    // Create a log entry
    await supabase
      .from("activity_logs")
      .insert({
        user_id: userId,
        action: `${type}_confirmation_email_sent`,
      });
    
    return new Response(
      JSON.stringify({ success: true, message: `Confirmation email sent to ${email}` }),
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
