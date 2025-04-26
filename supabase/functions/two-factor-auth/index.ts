
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as base32 from "https://deno.land/std@0.177.0/encoding/base32.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateTOTP(secret: string, counter: number): Promise<string> {
  try {
    // Clean up the secret to ensure it's valid base32
    const cleanSecret = secret.toUpperCase().replace(/\s/g, '');
    
    // Decode the base32 secret to get the key
    const key = base32.decode(cleanSecret);
    
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

async function validateTOTP(token: string, secret: string): Promise<boolean> {
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return false;
  }

  // Clean up and pad the secret
  const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
  
  // Ensure we have valid base32 characters
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
      const generatedToken = await generateTOTP(cleanSecret, counter);
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
      
      console.log(`Validating code: ${code} for secret: ${secret}`);
      const isValid = await validateTOTP(code, secret);
      console.log(`Validation result: ${isValid}`);
      
      if (isValid && userId) {
        // Check if a record exists for this user
        const { data: existingRecord, error: queryError } = await supabase
          .from('user_security')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        console.log("Existing record check:", existingRecord, queryError);
        
        let updateOperation;
        const securityRecord = {
          user_id: userId,
          google_auth_secret: secret.replace(/\s+/g, ''),
          google_auth_enabled: true,
          encryption_key: Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        };
        
        if (existingRecord) {
          console.log("Updating existing record for user:", userId);
          // Update existing record
          updateOperation = supabase
            .from('user_security')
            .update(securityRecord)
            .eq('user_id', userId);
        } else {
          console.log("Inserting new record for user:", userId);
          // Insert new record
          updateOperation = supabase
            .from('user_security')
            .insert([securityRecord]);
        }
        
        const { error: securityError } = await updateOperation;
          
        if (securityError) {
          console.error('Error updating security settings:', securityError);
          return new Response(
            JSON.stringify({ success: false, error: 'Database error: ' + securityError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        console.log("Security settings updated successfully, generating recovery codes");
        
        // Generate recovery codes
        const recoveryCodes = Array.from({ length: 8 }, () => {
          const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
          return code;
        });

        // Delete any existing recovery codes
        await supabase
          .from('user_recovery_codes')
          .delete()
          .eq('user_id', userId);
          
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
