
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

    let resetToken: string | null = null, expiresAtStr: string | null = null, userId: string | null = null;

    if (userExists.user) {
      userId = userExists.user.id;
      // Generate random token (UUID v4) and expiry (1h)
      resetToken = crypto.randomUUID();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
      expiresAtStr = expiresAt.toISOString();

      // Store in DB
      await supabaseClient
        .from('password_reset_tokens')
        .insert({
          email: normalizedEmail,
          token: resetToken,
          expires_at: expiresAtStr,
          used: false,
          created_at: now.toISOString(),
        });
    }

    // Always send ok response, but only send an email to real users
    if (userExists.user) {
      // Build branded email
      const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';
      const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}`;
      const resend = getResendClient();

      const logoSection = `
        <div style="text-align:center;margin-bottom:24px;">
          <img src="https://willtank.com/logo.svg" alt="WillTank logo" style="height:48px;"/>
        </div>`;
      const emailContent = `
        ${logoSection}
        <h2 style="text-align:center;">Reset Your WillTank Password</h2>
        <p style="font-size:16px;">You requested to reset your WillTank account password. Click the button below to set a new password. This link will expire in 1 hour, or after it is used.</p>
        <div style="text-align:center;margin:32px 0;">
          <a class="button" href="${resetUrl}" style="background:#4F46E5; color:#fff; padding:16px 32px; border-radius:8px; font-size:18px; text-decoration:none;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, you can safely ignore this email, or contact us at <a href="mailto:support@willtank.com">support@willtank.com</a>.</p>
      `;
      const html = buildDefaultEmailLayout(emailContent);
      const emailResp = await resend.emails.send({
        from: 'WillTank <support@willtank.com>',
        to: normalizedEmail,
        subject: 'WillTank Password Reset',
        html,
      });

      if (!isEmailSendSuccess(emailResp)) {
        console.error('Resend email failure:', formatResendError(emailResp));
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset instructions sent if account exists' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({ success: true, message: 'Password reset instructions sent if account exists' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
