
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as base32 from "https://deno.land/std@0.177.0/encoding/base32.ts";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";
import { getSupabaseClient, logVerificationEvent } from "../_shared/auth-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TOTP implementation
async function generateTOTP(secret: string, counter: number): Promise<string> {
  try {
    // Clean up and pad the secret
    const cleanSecret = secret.toUpperCase().replace(/\s/g, '');
    const paddedSecret = cleanSecret.padEnd(Math.ceil(cleanSecret.length / 8) * 8, '=');
    
    // Decode the base32 secret to get the key
    const key = base32.decode(paddedSecret);
    
    // Convert counter to buffer
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
      view.setUint8(7 - i, counter & 0xff);
      counter = counter >>> 8;
    }
    
    // Generate HMAC-SHA-1
    const counterBytes = new Uint8Array(buffer);
    const digest = await hmac("sha1", key, counterBytes);
    
    // Dynamic truncation
    const offset = digest[digest.length - 1] & 0x0f;
    const binary = 
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);
    
    // Generate 6-digit code
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating TOTP:', error);
    throw error;
  }
}

// Validate TOTP code
async function validateTOTP(token: string, secret: string): Promise<boolean> {
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return false;
  }

  try {
    // Clean up and pad the secret
    const cleanSecret = secret.toUpperCase().replace(/\s/g, '');
    const paddedSecret = cleanSecret.padEnd(Math.ceil(cleanSecret.length / 8) * 8, '=');
    
    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    
    // Check current and adjacent time windows
    for (let i = -1; i <= 1; i++) {
      const counter = Math.floor((now / timeStep)) + i;
      const generatedToken = await generateTOTP(paddedSecret, counter);
      
      if (generatedToken === token) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

// Generate a new TOTP secret
function generateTOTPSecret(): { secret: string; qrCodeUrl: string } {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const randomValues = new Uint8Array(16); // 16 bytes = 128 bits
  crypto.getRandomValues(randomValues);
  
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += charset.charAt(randomValues[i] % charset.length);
  }
  
  // Format secret for display
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret;
  
  // Create QR code URL
  const qrCodeUrl = `otpauth://totp/WillTank:User?issuer=WillTank&secret=${secret}&algorithm=SHA1&digits=6&period=30`;
  
  return { secret: formattedSecret, qrCodeUrl };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const reqBody = await req.json();
    const { action, code, secret, userId, email } = reqBody;
    
    console.log(`2FA request: action=${action}, userId=${userId}, email=${email || 'unknown'}`);
    
    const supabase = getSupabaseClient();
    
    if (action === 'setup') {
      // Generate a new 2FA secret
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
      
      // Validate the 2FA code
      const isValid = await validateTOTP(code, secret);
      
      // Log the validation attempt if email is provided
      if (email) {
        await logVerificationEvent(
          email, 
          '2fa', 
          isValid ? '2fa_success' : '2fa_failed',
          {
            userId,
            timestamp: new Date().toISOString()
          }
        );
      }
      
      // If code is valid and userId provided, update security settings
      if (isValid && userId) {
        // Store the secret securely in user_security
        const cleanSecret = secret.replace(/\s+/g, '');
        
        // Check for existing record
        const { data: existingRecord } = await supabase
          .from('user_security')
          .select('user_id')
          .eq('user_id', userId)
          .single();
        
        if (existingRecord) {
          // Update existing record
          await supabase
            .from('user_security')
            .update({
              two_factor_enabled: true,
              two_factor_secret: cleanSecret,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        } else {
          // Create new record
          await supabase
            .from('user_security')
            .insert({
              user_id: userId,
              two_factor_enabled: true,
              two_factor_secret: cleanSecret,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
        
        // Generate recovery codes
        const recoveryCodes = Array.from({ length: 8 }, () => {
          return Array.from(crypto.getRandomValues(new Uint8Array(4)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
        });
        
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: isValid ? 200 : 400 }
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
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
