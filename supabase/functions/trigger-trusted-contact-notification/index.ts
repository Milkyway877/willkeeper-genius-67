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

    // Fetch user profile (real name & email)
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

    // Fetch death verification settings (get trusted contact email)
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

    // Get trusted contact's "code word" and contact details
    const { data: trustedContact, error: trustedContactError } = await supabase
      .from('trusted_contacts')
      .select('name, email, phone, verification_code_word')
      .eq('email', settings.trusted_contact_email)
      .eq('user_id', userId)
      .single();

    // Get executor details
    const { data: executors, error: executorsError } = await supabase
      .from('will_executors')
      .select('*')
      .eq('user_id', userId)
      .order('primary_executor', { ascending: false });

    // Get latest missed checkin info
    const { data: checkin, error: checkinError } = await supabase
      .from('death_verification_checkins')
      .select('next_check_in, checked_in_at')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single();

    // Generate a single unlock code
    const unlockCode = crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();
    const verificationId = crypto.randomUUID();
    const { error: verificationError } = await supabase
      .from('will_unlock_codes')
      .insert({
        id: verificationId,
        user_id: userId,
        unlock_code: unlockCode,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        used: false
      });

    // Compose user name for personalization
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

    // Days overdue calculation
    const daysOverdue = !checkin?.next_check_in
      ? "unknown"
      : Math.floor((new Date().getTime() - new Date(checkin.next_check_in).getTime()) / (1000 * 60 * 60 * 24));

    // Executor info HTML
    let executorDetailsHtml = '';
    if (executors && executors.length > 0) {
      executorDetailsHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Executor Information</h3>
          ${executors.map((executor, idx) => `
            <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px;">
              <p><strong>${executor.primary_executor ? 'Primary ' : ''}Executor ${idx + 1}:</strong></p>
              <p><strong>Name:</strong> ${executor.name}</p>
              <p><strong>Email:</strong> ${executor.email}</p>
              <p><strong>Relation:</strong> ${executor.relation || 'Not specified'}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Code word HTML (highly prominent section)
    let codeWordSection = "";
    if (trustedContact?.verification_code_word) {
      codeWordSection = `
        <div style="background-color:#f0fdf4; border:2px solid #22c55e; margin:24px 0; border-radius:10px; padding:22px 16px 16px 16px; text-align:center;">
          <h2 style="font-size:1.2rem; color:#166534; margin-bottom:8px;">Your Unique Verification Code Word</h2>
          <div style="font-size:2.2rem; font-weight:bold; color:#16a34a; background:#dcfce7; border:2px dashed #16a34a; display:inline-block; border-radius:8px; padding:12px 30px; outline:4px solid #bbf7d0; margin-bottom:8px;">
            ${trustedContact.verification_code_word}
          </div>
          <div style="color:#166534; margin-top:8px; font-size:15px;">
            This word proves you are the real trusted contact. Please keep it safe!<br>
            You will need it if you help verify ${userName}'s status.
          </div>
        </div>
      `;
    }

    // Compose full email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Urgent: Death Verification Required for ${userName}</h1>
        <p>Dear ${trustedContact?.name || 'Trusted Contact'},</p>

        <p>
          <b>${userName}</b> (${user.email}) has missed their regular check-in on WillTank for 
          <b>${daysOverdue}</b> days.
        </p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">What does this mean?</h3>
          <p>
            WillTank users must check in every ${settings.check_in_frequency} days. When we can't reach them, 
            we contact trusted contacts—like you—to verify their status.
          </p>
        </div>

        <h3>What you need to do:</h3>
        <ol>
          <li>
            <b>Contact ${userName}</b> immediately by phone, text, email, or in person.
          </li>
          <li>
            <b>If you reach them:</b> Ask them to log into WillTank and check in.
          </li>
          <li>
            <b>If you cannot reach them within 48 hours:</b>
            This may mean a true emergency; the executor process may begin.
          </li>
        </ol>

        ${executorDetailsHtml}

        <div style="background-color: #fefbe9; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #ea580c; margin-top: 0;">Will Unlock Information &amp; Instructions</h3>
          <p>
            If you confirm that <strong>${userName}</strong> has passed away, 
            provide the following <b>Will Unlock Code</b> to the executor:
          </p>
          <div style="background-color: #fff; border-radius: 4px; padding: 10px; margin: 10px 0;">
            <p style="font-size: 1.7rem; font-weight:bold; letter-spacing:2px; color: #be185d; border:2px solid #fbcfe8; background: #fdf2f8; border-radius:7px; padding:8px 20px;">
              ${unlockCode}
            </p>
            <p style="font-size: 15px;">(Expires in 7 days · only share if death is confirmed)</p>
          </div>
          <p>
            Go to: <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/will-unlock">${supabaseUrl.replace('supabase.co', 'lovable.app')}/will-unlock</a>
          </p>
        </div>

        ${codeWordSection}

        <div style="background-color: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h4 style="color: #92400e; margin-top: 0;">About WillTank</h4>
          <p style="color: #92400e; margin: 0;">WillTank is a secure digital platform. Your role as a trusted contact is vital to protecting your loved one's wishes.</p>
        </div>

        <p style="font-size:14px;">
          If you have questions, email us at <a href="mailto:support@willtank.com">support@willtank.com</a>.
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} WillTank, a secure digital time capsule service.</p>
          <p style="color: #777; font-size: 12px;">If you did not expect this email, please contact support@willtank.com</p>
        </div>
      </div>
    `;

    // Send the email via Resend
    const resend = getResendClient();
    const emailResponse = await resend.emails.send({
      from: "WillTank Security <security@willtank.com>",
      to: [settings.trusted_contact_email],
      subject: `Urgent: Death Verification Required for ${userName} - Unlock & Code Word Included`,
      html: emailContent
    });

    // Log notification
    await supabase.from('death_verification_logs').insert({
      user_id: userId,
      action: 'trusted_contact_notified_with_unlock_code_and_code_word',
      details: {
        trusted_contact_email: settings.trusted_contact_email,
        unlock_code: unlockCode,
        verification_code_word: trustedContact?.verification_code_word,
        email_id: emailResponse.id,
        verification_id: verificationId
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Trusted contact notification sent with unlock code and code word",
        email_id: emailResponse.id,
        unlock_code: unlockCode,
        verification_id: verificationId
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending trusted contact notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: (error && (error.message || error.toString())) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
