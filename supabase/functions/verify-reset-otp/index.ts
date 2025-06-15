
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts'; // Import shared CORS headers

interface VerifyOtpRequest {
  email: string;
  code: string; // change from 'otp' to 'code' for consistency
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

    const { email, code }: VerifyOtpRequest = await req.json();

    if (!email || !code) {
      return new Response(JSON.stringify({ error: "Missing email or code" }), { status: 400, headers: corsHeaders });
    }

    // Look up OTP in DB
    const { data: tokenRow } = await supabaseClient
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('otp_code', code)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, reason: "expired_or_invalid" }), { status: 200, headers: corsHeaders });
    }

    // Lookup if user has 2FA enabled (user_security.google_auth_enabled)
    const { data: userRes } = await supabaseClient.auth.admin.getUserByEmail(tokenRow.email);

    if (!userRes?.user) {
      return new Response(JSON.stringify({ valid: false, reason: "user_not_found" }), { status: 200, headers: corsHeaders });
    }

    const { data: securityRow } = await supabaseClient
      .from('user_security')
      .select('google_auth_enabled')
      .eq('user_id', userRes.user.id)
      .maybeSingle();

    // Mark OTP code as "verified"
    await supabaseClient
      .from('password_reset_tokens')
      .update({ verified_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())
      .eq('otp_code', code);

    return new Response(JSON.stringify({
      valid: true,
      twoFARequired: !!securityRow?.google_auth_enabled
    }), { status: 200, headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ valid: false, reason: "unexpected_error" }), { status: 400, headers: corsHeaders });
  }
});
