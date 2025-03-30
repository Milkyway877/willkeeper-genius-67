
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

const checkinEmailTemplate = (executorName: string, userName: string, aliveUrl: string, deadUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Periodic User Status Check</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
    .button-container { text-align: center; margin: 20px 0; }
    .button { display: inline-block; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 0 10px; }
    .alive { background-color: #4f46e5; }
    .dead { background-color: #8B0000; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WillTank Periodic Check-in</h1>
  </div>
  <div class="content">
    <p>Hello ${executorName},</p>
    <p>As part of your role as an executor for ${userName}'s will, we periodically check on their status.</p>
    <p>Please confirm if ${userName} is:</p>
    <div class="button-container">
      <a href="${aliveUrl}" class="button alive">Still Alive</a>
      <a href="${deadUrl}" class="button dead">Deceased</a>
    </div>
    <p>This is a critical part of the will management process. Your response helps ensure the proper handling of ${userName}'s wishes.</p>
  </div>
  <div class="footer">
    <p>© 2025 WillTank. All rights reserved.</p>
    <p>This email was sent as part of the WillTank executor check-in process.</p>
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
    
    const { userId, executorEmail, executorName, userName } = await req.json();
    
    if (!userId || !executorEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: userId and executorEmail are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create check-in URLs
    const appUrl = supabaseUrl.replace(".supabase.co", ".app");
    const aliveUrl = `${appUrl}/checkin?status=alive&userId=${userId}&executor=${executorEmail}`;
    const deadUrl = `${appUrl}/checkin?status=dead&userId=${userId}&executor=${executorEmail}`;
    
    // Send the check-in email
    const displayExecutorName = executorName || executorEmail;
    const displayUserName = userName || "the user";
    
    const emailResponse = await resend.emails.send({
      from: "WillTank <noreply@willtank.app>",
      to: executorEmail,
      subject: `WillTank: Periodic Status Check for ${displayUserName}`,
      html: checkinEmailTemplate(displayExecutorName, displayUserName, aliveUrl, deadUrl)
    });
    
    console.log(`Check-in email sent to executor ${executorEmail}:`, emailResponse);
    
    // Update the last check-in time for this user-executor pair
    const { data: existingCheckin } = await supabase
      .from("user_checkins")
      .select("*")
      .eq("user_id", userId)
      .eq("executor_email", executorEmail)
      .single();
    
    if (existingCheckin) {
      await supabase
        .from("user_checkins")
        .update({ last_checkin: new Date().toISOString() })
        .eq("id", existingCheckin.id);
    } else {
      await supabase
        .from("user_checkins")
        .insert({
          user_id: userId,
          executor_email: executorEmail,
          last_checkin: new Date().toISOString(),
          status: "unknown"
        });
    }
    
    // Create a log entry
    await supabase
      .from("activity_logs")
      .insert({
        user_id: userId,
        action: "executor_checkin_email_sent",
      });
    
    return new Response(
      JSON.stringify({ success: true, message: `Check-in email sent to ${executorEmail}` }),
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
