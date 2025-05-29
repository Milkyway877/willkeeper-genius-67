
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getResendClient, buildDefaultEmailLayout } from "../_shared/email-helper.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CheckInEmailRequest {
  userId: string;
  checkInUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This could be triggered by a cron job or manually
    const { userId, checkInUrl } = await req.json() as CheckInEmailRequest;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the check-in settings
    const { data: settings, error: settingsError } = await supabase
      .from('death_verification_settings')
      .select('check_in_frequency, notification_preferences')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (settingsError) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Only send email if email notifications are enabled
    if (settings && settings.notification_preferences && settings.notification_preferences.email) {
      const userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email;
      const checkInFrequency = settings.check_in_frequency || 7;
      const resend = getResendClient();
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a6cf7;">Check-in Reminder</h1>
          <p>Hello ${userName},</p>
          <p>This is your regular ${checkInFrequency}-day check-in reminder from WillTank. Please confirm your status by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkInUrl}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">I'M ALIVE</a>
          </div>
          <p>If you don't respond within 7 days, a verification process will be triggered with your beneficiaries and executors.</p>
          <p>Thank you for using WillTank to protect your digital legacy.</p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            This is an automated message. If you believe you've received this in error, please contact support@willtank.com.
          </p>
        </div>
      `;
      
      // Send check-in reminder email
      const emailResponse = await resend.emails.send({
        from: "WillTank <checkins@willtank.com>",
        to: [userData.email],
        subject: "WillTank Check-in Reminder",
        html: buildDefaultEmailLayout(emailContent)
      });
      
      // Log the check-in email
      await supabase.from('death_verification_logs').insert({
        user_id: userId,
        action: 'checkin_email_sent',
        details: {
          email: userData.email,
          sent_at: new Date().toISOString(),
          email_id: emailResponse.id,
        }
      });
      
      return new Response(
        JSON.stringify({ success: true, message: "Check-in email sent successfully", emailId: emailResponse.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Email notifications are disabled, log and return
      await supabase.from('death_verification_logs').insert({
        user_id: userId,
        action: 'checkin_email_skipped',
        details: {
          reason: "Email notifications disabled",
          timestamp: new Date().toISOString(),
        }
      });
      
      return new Response(
        JSON.stringify({ success: false, message: "Email notifications are disabled for this user" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error sending check-in email:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
