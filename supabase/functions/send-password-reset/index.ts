
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { getResendClient, buildDefaultEmailLayout, isEmailSendSuccess, formatResendError } from '../_shared/email-helper.ts'

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
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

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

        // Try to send custom branded email as well
        try {
          const resend = getResendClient();
          
          const emailContent = `
            <div style="text-align: center; padding: 40px 20px;">
              <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 20px;">Reset Your WillTank Password</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                You requested to reset your password for your WillTank account. Click the button below to create a new password.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
                This link will expire in 1 hour for your security.
              </p>
              <div style="margin: 30px 0;">
                <a href="${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/auth/reset-password" 
                   style="background-color: #1f2937; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you didn't request this password reset, you can safely ignore this email.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                For security reasons, this link can only be used once.
              </p>
            </div>
          `;

          const emailResponse = await resend.emails.send({
            from: 'WillTank Security <security@willtank.com>',
            to: [normalizedEmail],
            subject: 'Reset Your WillTank Password',
            html: buildDefaultEmailLayout(emailContent),
          });

          if (!isEmailSendSuccess(emailResponse)) {
            console.error('Custom email send failed:', formatResendError(emailResponse));
            // Don't fail the whole operation if custom email fails
          } else {
            console.log('Custom reset email sent successfully');
          }
        } catch (customEmailError) {
          console.error('Custom email error (non-critical):', customEmailError);
          // Continue - Supabase email should still work
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
