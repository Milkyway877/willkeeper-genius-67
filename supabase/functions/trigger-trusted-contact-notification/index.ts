
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

    // Get executor details
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', userId)
      .order('primary_executor', { ascending: false });

    if (executorsError) {
      console.error('Error fetching executors:', executorsError);
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

    // Generate a single unlock code
    const unlockCode = crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();
    
    // Create verification record with single unlock code
    const verificationId = crypto.randomUUID();
    const { error: verificationError } = await supabase
      .from('will_unlock_codes')
      .insert({
        id: verificationId,
        user_id: userId,
        unlock_code: unlockCode,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        used: false
      });

    if (verificationError) {
      console.error('Error creating verification record:', verificationError);
      return new Response(
        JSON.stringify({ error: "Failed to create verification record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    const resend = getResendClient();

    // Calculate days overdue
    const nextCheckinDate = new Date(checkin.next_check_in);
    const now = new Date();
    const daysOverdue = Math.floor((now.getTime() - nextCheckinDate.getTime()) / (1000 * 60 * 60 * 24));

    // Build executor details section
    let executorDetailsHtml = '';
    if (executors && executors.length > 0) {
      executorDetailsHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Executor Information</h3>
          ${executors.map((executor, index) => `
            <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px;">
              <p><strong>${executor.primary_executor ? 'Primary ' : ''}Executor ${index + 1}:</strong></p>
              <p><strong>Name:</strong> ${executor.name}</p>
              <p><strong>Email:</strong> ${executor.email}</p>
              <p><strong>Relation:</strong> ${executor.relation || 'Not specified'}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Urgent: Death Verification Required</h1>
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
          <li><strong>If you cannot reach them after 48 hours:</strong> This may indicate a serious situation that requires the executor process</li>
        </ol>

        ${executorDetailsHtml}

        <div style="background-color: #fefbf3; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #ea580c; margin-top: 0;">Will Unlock Information</h3>
          <p>If you have confirmed that ${userName} has passed away, please provide the following information to the executor:</p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 10px 0;">
            <p><strong>Will Unlock Code:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; color: #dc2626;">${unlockCode}</code></p>
            <p><strong>Unlock URL:</strong> <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/will-unlock" style="color: #4f46e5;">${supabaseUrl.replace('supabase.co', 'lovable.app')}/will-unlock</a></p>
            <p><strong>Code Expires:</strong> 7 days from now</p>
          </div>
        </div>

        <div style="background-color: #fefbf3; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #ea580c; margin-top: 0;">Important Information</h3>
          <p><strong>User:</strong> ${userName}<br>
          <strong>Email:</strong> ${user.email}<br>
          <strong>Last Check-in:</strong> ${new Date(checkin.checked_in_at).toLocaleDateString()}<br>
          <strong>Days Overdue:</strong> ${daysOverdue}</p>
        </div>

        <p>Thank you for serving as a trusted contact. Your role is crucial in ensuring ${userName}'s digital legacy is protected according to their wishes.</p>

        <p>Best regards,<br>
        The WillTank Security Team</p>
      </div>
    `;

    // Send email to trusted contact
    const emailResponse = await resend.emails.send({
      from: "WillTank Security <security@willtank.com>",
      to: [settings.trusted_contact_email],
      subject: `Urgent: Death Verification Required for ${userName} - Unlock Code Included`,
      html: buildDefaultEmailLayout(emailContent)
    });

    if (!emailResponse.id) {
      throw new Error("Failed to send trusted contact notification email");
    }

    // Log the notification
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'trusted_contact_notified_with_unlock_code',
      details: {
        trusted_contact_email: settings.trusted_contact_email,
        days_overdue: daysOverdue,
        email_id: emailResponse.id,
        unlock_code: unlockCode,
        verification_id: verificationId
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Trusted contact notification sent with unlock code",
        email_id: emailResponse.id,
        unlock_code: unlockCode,
        verification_id: verificationId
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
