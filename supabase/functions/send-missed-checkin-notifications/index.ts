
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getResendClient, buildDefaultEmailLayout } from "../_shared/email-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NotificationRequest {
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json() as NotificationRequest;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing missed check-in notification for user: ${userId}`);

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get death verification settings for trusted contact
    const { data: settings, error: settingsError } = await supabase
      .from('death_verification_settings')
      .select('trusted_contact_email, check_in_frequency')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.trusted_contact_email) {
      console.error('No trusted contact configured:', settingsError);
      return new Response(
        JSON.stringify({ error: "No trusted contact email configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get latest check-in info
    const { data: checkin, error: checkinError } = await supabase
      .from('death_verification_checkins')
      .select('next_check_in, checked_in_at')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single();

    if (checkinError || !checkin) {
      console.error('No check-in data found:', checkinError);
      return new Response(
        JSON.stringify({ error: "No check-in data found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate days overdue
    const nextCheckinDate = new Date(checkin.next_check_in);
    const now = new Date();
    const daysOverdue = Math.floor((now.getTime() - nextCheckinDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue <= 0) {
      return new Response(
        JSON.stringify({ message: "User is not overdue for check-in" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userName = user.full_name || 
      (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email);

    // Send simple notification email
    const resend = getResendClient();
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Missed Check-in Alert</h1>
        <p>Dear Trusted Contact,</p>
        <p><strong>${userName}</strong> has missed their regular check-in on WillTank for <strong>${daysOverdue} days</strong>.</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">What you should do:</h3>
          <ol style="color: #374151;">
            <li><strong>Contact ${userName} immediately</strong> using your usual methods (phone, text, email, or in person)</li>
            <li><strong>If you reach them:</strong> Ask them to log into WillTank and complete their check-in</li>
            <li><strong>If you cannot reach them:</strong> This may indicate a serious situation</li>
          </ol>
        </div>

        <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h4 style="color: #374151; margin-top: 0;">Details</h4>
          <p><strong>User:</strong> ${userName}<br>
          <strong>Email:</strong> ${user.email}<br>
          <strong>Days Overdue:</strong> ${daysOverdue}<br>
          <strong>Last Check-in:</strong> ${new Date(checkin.checked_in_at).toLocaleDateString()}</p>
        </div>

        <p>Thank you for serving as a trusted contact for ${userName}.</p>
        <p>Best regards,<br>The WillTank Team</p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "WillTank <notifications@willtank.com>",
      to: [settings.trusted_contact_email],
      subject: `Missed Check-in Alert: ${userName} (${daysOverdue} days overdue)`,
      html: buildDefaultEmailLayout(emailContent)
    });

    if (!emailResponse.id) {
      throw new Error("Failed to send notification email");
    }

    console.log(`Notification email sent successfully: ${emailResponse.id}`);

    // Log the notification
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'missed_checkin_notification_sent',
      details: {
        trusted_contact_email: settings.trusted_contact_email,
        days_overdue: daysOverdue,
        email_id: emailResponse.id
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Missed check-in notification sent successfully",
        email_id: emailResponse.id,
        days_overdue: daysOverdue,
        trusted_contact: settings.trusted_contact_email
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending missed check-in notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
