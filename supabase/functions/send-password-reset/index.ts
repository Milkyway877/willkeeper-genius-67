
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PasswordResetRequest {
  email: string;
}

interface RateLimitRecord {
  email: string;
  attempts: number;
  last_attempt: string;
  blocked_until?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email }: PasswordResetRequest = await req.json()

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limiting
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get recent reset attempts for this email
    const { data: recentAttempts, error: rateLimitError } = await supabaseClient
      .from('password_reset_tokens')
      .select('*')
      .eq('email', normalizedEmail)
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    // Rate limiting logic
    const attemptsInLastHour = recentAttempts?.length || 0;
    if (attemptsInLastHour >= 3) {
      console.log(`Rate limit exceeded for email: ${normalizedEmail}`);
      
      // Still return success to prevent email enumeration
      return new Response(
        JSON.stringify({ success: true, message: 'Password reset instructions sent if account exists' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user exists (don't reveal this in response)
    const { data: userExists } = await supabaseClient.auth.admin.getUserByEmail(normalizedEmail);
    
    let resetSuccess = false;
    
    if (userExists.user) {
      try {
        // Generate reset token
        const resetToken = crypto.randomUUID();
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour expiry

        // Store reset token in database
        const { error: tokenError } = await supabaseClient
          .from('password_reset_tokens')
          .insert({
            email: normalizedEmail,
            token: resetToken,
            expires_at: expiresAt.toISOString(),
            used: false,
            created_at: now.toISOString()
          });

        if (tokenError) {
          console.error('Error storing reset token:', tokenError);
          throw new Error('Failed to generate reset token');
        }

        // Send reset email using Supabase Auth
        const { error: resetError } = await supabaseClient.auth.admin.generateLink({
          type: 'recovery',
          email: normalizedEmail,
          options: {
            redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/auth/reset-password`
          }
        });

        if (resetError) {
          console.error('Supabase reset error:', resetError);
          throw new Error('Failed to send reset email');
        }

        resetSuccess = true;
        
        // Log successful reset attempt
        await supabaseClient
          .from('password_reset_audit')
          .insert({
            email: normalizedEmail,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
            success: true,
            created_at: now.toISOString()
          });

      } catch (error) {
        console.error('Password reset error:', error);
        
        // Log failed attempt
        await supabaseClient
          .from('password_reset_audit')
          .insert({
            email: normalizedEmail,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
            success: false,
            error_message: error.message,
            created_at: now.toISOString()
          });
      }
    }

    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset instructions sent if account exists' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Password reset function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset instructions sent if account exists' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
