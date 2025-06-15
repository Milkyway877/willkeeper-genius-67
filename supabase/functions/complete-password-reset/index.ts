
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { authenticator } from 'https://esm.sh/otplib@12.0.1';
import { corsHeaders } from '../_shared/cors.ts'; // Import shared CORS headers

interface CompleteResetRequest {
  email: string;
  otp: string;
  newPassword: string;
  twoFACode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, otp, newPassword, twoFACode }: CompleteResetRequest = await req.json();

    if (!email || !otp || !newPassword) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }

    // Find token
    const { data: tokenRow } = await supabaseClient
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('otp_code', otp)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (!tokenRow || new Date(tokenRow.expires_at) < new Date() || !tokenRow.verified_at) {
      return new Response(JSON.stringify({ success: false, reason: "expired_or_invalid" }), { status: 200, headers: corsHeaders });
    }

    // Find user
    const { data: userRes } = await supabaseClient.auth.admin.getUserByEmail(tokenRow.email);
    if (!userRes?.user) {
      return new Response(JSON.stringify({ success: false, reason: "user_not_found" }), { status: 200, headers: corsHeaders });
    }

    // Check 2FA status
    const { data: securityRow } = await supabaseClient
      .from('user_security')
      .select('google_auth_enabled, google_auth_secret')
      .eq('user_id', userRes.user.id)
      .maybeSingle();

    if (securityRow?.google_auth_enabled) {
      // Require 2FA code
      if (!twoFACode || !securityRow.google_auth_secret) {
        return new Response(JSON.stringify({ success: false, reason: "2fa_required" }), { status: 200, headers: corsHeaders });
      }
      // Verify TOTP
      const isValid2FA = authenticator.check(twoFACode, securityRow.google_auth_secret);
      if (!isValid2FA) {
        return new Response(JSON.stringify({ success: false, reason: "invalid_2fa" }), { status: 200, headers: corsHeaders });
      }
    }

    // Update password
    const { error: pwErr } = await supabaseClient.auth.admin.updateUserById(userRes.user.id, {
      password: newPassword,
    });
    if (pwErr) {
      return new Response(JSON.stringify({ success: false, reason: "password_update_failed" }), { status: 200, headers: corsHeaders });
    }

    // Mark OTP as used
    await supabaseClient
      .from('password_reset_tokens')
      .update({ used: true, step: 'password_reset', verified_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())
      .eq('otp_code', otp);

    // Optionally: Send notification of password change

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, reason: "unexpected_error" }), { status: 400, headers: corsHeaders });
  }
});
