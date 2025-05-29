
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get death verification settings
    const { data: settings, error: settingsError } = await supabase
      .from('death_verification_settings')
      .select('trusted_contact_email, check_in_frequency')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.trusted_contact_email) {
      return new Response(
        JSON.stringify({ error: "No trusted contact configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get latest missed checkin info
    const { data: checkin, error: checkinError } = await supabase
      .from('death_verification_checkins')
      .select('next_check_in, checked_in_at')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single();

    if (checkinError || !checkin) {
      return new Response(
        JSON.stringify({ error: "No checkin data found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    const resend = getResendClient();

    // Calculate days overdue
    const nextCheckinDate = new Date(checkin.next_check_in);
    const now = new Date();
    const daysOverdue = Math.floor((now.getTime() - nextCheckinDate.getTime()) / (1000 * 60 * 60 * 24));

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Urgent: Wellness Check Required</h1>
        <p>Dear Trusted Contact,</p>
        <p>You are receiving this message because <strong>${userName}</strong> has missed their regular check-in on WillTank for <strong>${daysOverdue} days</strong>.</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">What does this mean?</h3>
          <p>WillTank users are required to check in every ${settings.check_in_frequency} days to confirm they are well. When this doesn't happen, we reach out to trusted contacts like you to verify their status.</p>
        </div>

        <h3>What you need to do:</h3>
        <ol>
          <li><strong>Contact ${userName}</strong> immediately using your usual methods (phone, text, email, or in person)</li>
          <li><strong>If you reach them:</strong> Please ask them to log into their WillTank account and complete their check-in</li>
          <li><strong>If you cannot reach them after 48 hours:</strong> This may indicate a serious situation that requires further verification</li>
        </ol>

        <div style="background-color: #fefbf3; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #ea580c; margin-top: 0;">Important Information</h3>
          <p><strong>User:</strong> ${userName}<br>
          <strong>Email:</strong> ${user.email}<br>
          <strong>Last Check-in:</strong> ${new Date(checkin.checked_in_at).toLocaleDateString()}<br>
          <strong>Days Overdue:</strong> ${daysOverdue}</p>
        </div>

        <p>If after 48 hours you have been unable to contact ${userName}, or if you have reason to believe they may have passed away, please respond to this email with your findings. This will trigger the next phase of their digital legacy protection process.</p>

        <p>Thank you for serving as a trusted contact. Your role is crucial in ensuring ${userName}'s digital legacy is protected according to their wishes.</p>

        <p>Best regards,<br>
        The WillTank Security Team</p>
      </div>
    `;

    // Send email to trusted contact
    const emailResponse = await resend.emails.send({
      from: "WillTank Security <security@willtank.com>",
      to: [settings.trusted_contact_email],
      subject: `Urgent: Wellness Check Required for ${userName}`,
      html: buildDefaultEmailLayout(emailContent)
    });

    if (!emailResponse.id) {
      throw new Error("Failed to send trusted contact notification email");
    }

    // Log the notification
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'trusted_contact_notified',
      details: {
        trusted_contact_email: settings.trusted_contact_email,
        days_overdue: daysOverdue,
        email_id: emailResponse.id
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Trusted contact notification sent",
        email_id: emailResponse.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending trusted contact notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
