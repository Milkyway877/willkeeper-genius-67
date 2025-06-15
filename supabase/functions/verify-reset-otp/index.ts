
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOtpRequest {
  email: string;
  otp: string;
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

    const { email, otp }: VerifyOtpRequest = await req.json();

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Missing email or code" }), { status: 400, headers: corsHeaders });
    }

    // Look up OTP in DB
    const { data: tokenRow } = await supabaseClient
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('otp_code', otp)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
      return new Response(JSON.stringify({ success: false, reason: "expired_or_invalid" }), { status: 200, headers: corsHeaders });
    }

    // Lookup if user has 2FA enabled (assume google_auth_enabled on a user_security table)
    const { data: userRes } = await supabaseClient.auth.admin.getUserByEmail(tokenRow.email);

    if (!userRes?.user) {
      return new Response(JSON.stringify({ success: false, reason: "user_not_found" }), { status: 200, headers: corsHeaders });
    }

    // You must adapt this for your users' security setup!
    // Just a mock lookup to another table:
    const { data: securityRow } = await supabaseClient
      .from('user_security')
      .select('google_auth_enabled')
      .eq('user_id', userRes.user.id)
      .maybeSingle();

    // Mark OTP code as "verified"; DO NOT update as used yet (used = password has been changed)
    await supabaseClient
      .from('password_reset_tokens')
      .update({ verified_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())
      .eq('otp_code', otp);

    return new Response(JSON.stringify({
      success: true,
      userHas2FA: !!securityRow?.google_auth_enabled
    }), { status: 200, headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, reason: "unexpected_error" }), { status: 400, headers: corsHeaders });
  }
});
