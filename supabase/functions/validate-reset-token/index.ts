
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenValidateRequest {
  token: string;
  newPassword?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  if (req.method === 'POST') {
    // This is the password reset submission
    try {
      const { token, newPassword }: TokenValidateRequest = await req.json();
      if (!token || !newPassword || newPassword.length < 8) {
        return new Response(
          JSON.stringify({ error: "Invalid token or password" }),
          { status: 400, headers: corsHeaders }
        );
      }
      // Find token and check if valid
      const { data: tokenRow } = await supabaseClient
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (!tokenRow || tokenRow.used || new Date(tokenRow.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "This link is invalid or expired." }),
          { status: 400, headers: corsHeaders }
        );
      }
      // Find user and update password
      const { data: userRes } = await supabaseClient.auth.admin.getUserByEmail(tokenRow.email);
      if (!userRes?.user) {
        return new Response(JSON.stringify({ error: "User not found." }), { status: 400, headers: corsHeaders });
      }
      const { error: pwErr } = await supabaseClient.auth.admin.updateUserById(userRes.user.id, {
        password: newPassword
      });
      if (pwErr) {
        return new Response(JSON.stringify({ error: "Failed to set password." }), { status: 400, headers: corsHeaders });
      }
      // Mark token used
      await supabaseClient
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token);

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 400, headers: corsHeaders });
    }
  } else if (req.method === 'GET') {
    // Just validate token (on page load)
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return new Response(JSON.stringify({ valid: false }), { status: 400, headers: corsHeaders });
    }
    const { data: tokenRow } = await supabaseClient
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single();
    if (!tokenRow || tokenRow.used || new Date(tokenRow.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false }), { status: 200, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ valid: true }), { status: 200, headers: corsHeaders });
  }
});
