
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as base32 from "https://deno.land/std@0.177.0/encoding/base32.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateTOTP(secret: string, counter: number): string {
  try {
    const key = base32.decode(secret.toUpperCase().replace(/\s/g, ''));
    
    // Convert counter to buffer
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
      view.setUint8(7 - i, counter & 0xff);
      counter = counter >>> 8;
    }
    
    // Generate HMAC-SHA-1
    const hmacKey = new Uint8Array(key);
    const hmac = new Uint8Array(
      crypto.subtle.digestSync(
        "SHA-1", 
        crypto.subtle.hmacKeyGenSync("HMAC", hmacKey)
      )
    );
    
    // Dynamic truncation
    const offset = hmac[hmac.length - 1] & 0xf;
    const binary = 
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    
    // Generate 6-digit code
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating TOTP:', error);
    throw error;
  }
}

function validateTOTP(token: string, secret: string): boolean {
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return false;
  }

  const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
  
  if (!/^[A-Z2-7]+=*$/.test(cleanSecret)) {
    console.error("Invalid base32 secret format:", cleanSecret);
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  
  // Check current and adjacent time windows
  for (let i = -1; i <= 1; i++) {
    const counter = Math.floor((now / timeStep)) + i;
    try {
      const generatedToken = generateTOTP(cleanSecret, counter);
      if (generatedToken === token) {
        return true;
      }
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
  
  return false;
}

function generateTOTPSecret(): { secret: string; qrCodeUrl: string } {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const randomValues = new Uint8Array(20);
  crypto.getRandomValues(randomValues);
  
  let secret = '';
  for (let i = 0; i < 20; i++) {
    secret += charset.charAt(randomValues[i] % charset.length);
  }
  
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret;
  const qrCodeUrl = `otpauth://totp/WillTank:User?issuer=WillTank&secret=${secret}&algorithm=SHA1&digits=6&period=30`;
  
  return { secret: formattedSecret, qrCodeUrl };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const reqJson = await req.json();
    const { action, code, secret, userId } = reqJson;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (action === 'generate') {
      const { secret, qrCodeUrl } = generateTOTPSecret();
      
      return new Response(
        JSON.stringify({ success: true, secret, qrCodeUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } 
    else if (action === 'validate') {
      if (!code || !secret) {
        return new Response(
          JSON.stringify({ success: false, error: 'Code and secret are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      const isValid = validateTOTP(code, secret);
      
      if (isValid && userId) {
        // Update user security settings in the database
        const { error: securityError } = await supabase
          .from('user_security')
          .upsert({ 
            user_id: userId,
            google_auth_secret: secret.replace(/\s+/g, ''),
            google_auth_enabled: true,
            encryption_key: Array.from(crypto.getRandomValues(new Uint8Array(32)))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('')
          }, { 
            onConflict: 'user_id'
          });
          
        if (securityError) {
          console.error('Error updating security settings:', securityError);
          return new Response(
            JSON.stringify({ success: false, error: 'Database error: ' + securityError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        // Generate recovery codes
        const recoveryCodes = Array.from({ length: 8 }, () => {
          const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
          return code;
        });

        // Store recovery codes in the database
        const { error: recoveryError } = await supabase
          .from('user_recovery_codes')
          .insert(
            recoveryCodes.map(code => ({
              user_id: userId,
              code,
              used: false
            }))
          );

        if (recoveryError) {
          console.error('Error storing recovery codes:', recoveryError);
          // We still return success since 2FA is enabled, recovery codes are optional
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            recoveryCodes: recoveryCodes 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: isValid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } 
    else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error: ' + error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
