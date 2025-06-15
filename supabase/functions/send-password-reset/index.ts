import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { getResendClient, buildDefaultEmailLayout, isEmailSendSuccess, formatResendError } from '../_shared/email-helper.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email }: PasswordResetRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    // Rate limit: 3 per hour
    const { data: recentAttempts } = await supabaseClient
      .from('password_reset_tokens')
      .select('*')
      .eq('email', normalizedEmail)
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false });

    if ((recentAttempts?.length ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ success: true, message: 'Password reset instructions sent if account exists' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user exists
    const { data: userExists } = await supabaseClient.auth.admin.getUserByEmail(normalizedEmail);

    let otpCode: string | null = null, expiresAtStr: string | null = null, userId: string | null = null;

    if (userExists.user) {
      userId = userExists.user.id;
      // Generate random 6-digit OTP and expiry (15min)
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
      expiresAtStr = expiresAt.toISOString();

      // Store in DB
      await supabaseClient
        .from('password_reset_tokens')
        .insert({
          email: normalizedEmail,
          otp_code: otpCode,
          expires_at: expiresAtStr,
          used: false,
          created_at: now.toISOString(),
        });
    }

    // Always send ok response, but only send an email to real users
    if (userExists.user && otpCode) {
      // Build branded email
      const resend = getResendClient();
      const logoSection = `
        <div style="text-align:center;margin-bottom:24px;">
          <img src="https://willtank.com/logo.svg" alt="WillTank logo" style="height:48px;"/>
        </div>`;
      const emailContent = `
        ${logoSection}
        <h2 style="text-align:center;">Your WillTank Password Reset Code</h2>
        <p style="font-size:16px;">Use the code below to reset your WillTank account password. Do not share this code with anyone.</p>
        <div style="text-align:center; margin:32px 0;">
          <div style="display:inline-block; background:#fff; border:2px solid #4F46E5; color:#222; font-size:32px; letter-spacing:9px; border-radius:8px; padding:12px 24px;"><b>${otpCode}</b></div>
        </div>
        <p>This code expires in 15 minutes.</p>
        <p>If you did not request a password reset, ignore this email or contact us at <a href="mailto:support@willtank.com">support@willtank.com</a>.</p>
      `;
      const html = buildDefaultEmailLayout(emailContent);
      const emailResp = await resend.emails.send({
        from: 'WillTank <support@willtank.com>',
        to: normalizedEmail,
        subject: 'Your WillTank Password Reset Code',
        html,
      });

      if (!isEmailSendSuccess(emailResp)) {
        console.error('Resend email failure:', formatResendError(emailResp));
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset code sent if account exists' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({ success: true, message: 'Password reset code sent if account exists' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
