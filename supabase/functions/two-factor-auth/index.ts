
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
    // Clean up the secret and ensure proper padding
    const cleanSecret = secret.toUpperCase().replace(/\s/g, '');
    
    // Add padding if needed (Base32 requires length to be a multiple of 8)
    const paddedSecret = cleanSecret.padEnd(Math.ceil(cleanSecret.length / 8) * 8, '=');
    
    console.log(`Generating TOTP for secret: ${paddedSecret}`);
    
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
    const result = otp.toString().padStart(6, '0');
    
    console.log(`Generated TOTP: ${result}`);
    return result;
  } catch (error) {
    console.error('Error generating TOTP:', error);
    throw error;
  }
}

async function validateTOTP(token: string, secret: string): Promise<boolean> {
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    console.error("Invalid token format:", token);
    return false;
  }

  try {
    // Clean up the secret and ensure proper padding
    const cleanSecret = secret.toUpperCase().replace(/\s/g, '');
    
    // Add padding if necessary to make it a valid base32 string
    const paddedSecret = cleanSecret.padEnd(Math.ceil(cleanSecret.length / 8) * 8, '=');
    
    console.log(`Validating token ${token} with secret: ${paddedSecret}`);
    
    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    
    // Check current and adjacent time windows
    for (let i = -1; i <= 1; i++) {
      const counter = Math.floor((now / timeStep)) + i;
      const generatedToken = await generateTOTP(paddedSecret, counter);
      
      console.log(`Comparing: ${generatedToken} vs ${token} for counter ${counter}`);
      
      if (generatedToken === token) {
        console.log("Token valid!");
        return true;
      }
    }
    
    console.log("Token invalid - no match found in time windows");
    return false;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

function generateTOTPSecret(): { secret: string; qrCodeUrl: string } {
  // Use a proper Base32 charset (no padding characters)
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const randomValues = new Uint8Array(16); // 16 bytes = 128 bits
  crypto.getRandomValues(randomValues);
  
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += charset.charAt(randomValues[i] % charset.length);
  }
  
  // Group in sets of 4 for readability
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret;
  
  // Ensure no spaces in the URL
  const qrCodeUrl = `otpauth://totp/WillTank:User?issuer=WillTank&secret=${secret}&algorithm=SHA1&digits=6&period=30`;
  
  console.log(`Generated TOTP secret: ${formattedSecret}`);
  console.log(`QR code URL: ${qrCodeUrl}`);
  
  return { secret: formattedSecret, qrCodeUrl };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const reqJson = await req.json();
    const { action, code, secret, userId } = reqJson;
    
    console.log(`Request: action=${action}, userId=${userId}`);
    
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
      
      console.log(`Setting up 2FA with code: ${code} and secret: ${secret}`);
      
      const isValid = await validateTOTP(code, secret);
      console.log(`Validation result: ${isValid}`);
      
      if (isValid && userId) {
        console.log(`Setting up 2FA for user: ${userId}`);
        
        // Check if a record exists for this user
        const { data: existingRecord, error: queryError } = await supabase
          .from('user_security')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        console.log("Existing record check:", existingRecord, queryError);
        
        // Generate a new encryption key
        const encryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Clean up the secret (remove spaces)
        const cleanSecret = secret.replace(/\s+/g, '');
        
        let updateOperation;
        const securityRecord = {
          user_id: userId,
          google_auth_secret: cleanSecret,
          google_auth_enabled: true,
          encryption_key: encryptionKey
        };
        
        try {
          if (existingRecord) {
            console.log("Updating existing record for user:", userId);
            // Update existing record
            const { data, error } = await supabase
              .from('user_security')
              .update(securityRecord)
              .eq('user_id', userId)
              .select();
              
            if (error) throw error;
            console.log("Security record updated:", data);
          } else {
            console.log("Inserting new record for user:", userId);
            // Insert new record
            const { data, error } = await supabase
              .from('user_security')
              .insert([securityRecord])
              .select();
              
            if (error) throw error;
            console.log("Security record created:", data);
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
        } catch (dbError) {
          console.error('Database operation error:', dbError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Database operation error: ' + (dbError instanceof Error ? dbError.message : String(dbError))
            }),
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
      JSON.stringify({ success: false, error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
