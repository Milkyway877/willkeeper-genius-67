
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as base32 from "https://deno.land/std@0.177.0/encoding/base32.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TOTP functionality based on RFC 6238
function generateTOTP(secret: string, counter: number): string {
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
}

function validateTOTP(token: string, secret: string): boolean {
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return false;
  }

  // Clean up the secret - remove spaces and ensure proper base32 format
  const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
  
  // Check if the secret is valid base32
  if (!/^[A-Z2-7]+=*$/.test(cleanSecret)) {
    console.error("Secret is not valid base32 format:", cleanSecret);
    return false;
  }

  // Get the current time in seconds
  const now = Math.floor(Date.now() / 1000);
  
  // Check current and adjacent time windows (-1, 0, +1) to account for time drift
  const timeStep = 30; // Standard time step for TOTP
  for (let i = -1; i <= 1; i++) {
    const counter = Math.floor((now / timeStep)) + i;
    const generatedToken = generateTOTP(cleanSecret, counter);
    if (generatedToken === token) {
      return true;
    }
  }
  
  return false;
}

function generateTOTPSecret(): { secret: string; qrCodeUrl: string } {
  // Generate a random 20-character base32 secret
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const randomValues = new Uint8Array(20);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 20; i++) {
    secret += charset.charAt(randomValues[i] % charset.length);
  }
  
  // Format into 4-character groups for readability
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret;
  
  // Create a QR code URL
  const qrCodeUrl = `otpauth://totp/WillTank:User?issuer=WillTank&secret=${secret}&algorithm=SHA1&digits=6&period=30`;
  
  return { secret: formattedSecret, qrCodeUrl };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const reqJson = await req.json();
    const { action, code, secret, email, userId } = reqJson;
    
    // Create Supabase client using environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (action === 'generate') {
      // Generate new TOTP secret and QR code URL
      const { secret, qrCodeUrl } = generateTOTPSecret();
      
      return new Response(
        JSON.stringify({ success: true, secret, qrCodeUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } 
    else if (action === 'validate') {
      // Validate TOTP code
      if (!code || !secret) {
        return new Response(
          JSON.stringify({ success: false, error: 'Code and secret are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      const isValid = validateTOTP(code, secret);
      
      if (isValid && userId) {
        // If code is valid and we have a userId, update the user's security settings
        const { data, error } = await supabase
          .from('user_security')
          .upsert({ 
            user_id: userId,
            google_auth_secret: secret.replace(/\s+/g, ''),
            google_auth_enabled: true 
          }, { onConflict: 'user_id' });
          
        if (error) {
          console.error('Error updating security settings:', error);
          return new Response(
            JSON.stringify({ success: false, error: 'Database error' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
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
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
