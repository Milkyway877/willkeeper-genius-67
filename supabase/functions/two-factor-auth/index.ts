
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getSupabaseClient } from "../_shared/db-helper.ts";
import * as OTPAuth from "npm:otpauth@9.2.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a cryptographically secure random secret
const generateSecret = () => {
  // Generate a random 20-character base32 secret
  return OTPAuth.Secret.generate(20);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, email, code, secret, userId } = await req.json();
    const supabase = getSupabaseClient();
    
    // Handle different actions
    switch (action) {
      case "generate": {
        // Generate a new secret for setting up Google Authenticator
        const secret = generateSecret();
        
        // Create a TOTP object
        const totp = new OTPAuth.TOTP({
          issuer: "WillTank",
          label: email || "user",
          secret,
          digits: 6,
          period: 30
        });
        
        // Get the URL for generating a QR code
        const qrCodeUrl = totp.toString();
        
        return new Response(
          JSON.stringify({
            success: true,
            secret: secret.base32,
            qrCodeUrl
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      case "verify": {
        // Verify a TOTP code against the user's stored secret
        if (!email || !code) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing email or code"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        // Get the user's secret from the database
        const { data: securityData, error: securityError } = await supabase
          .from("user_security")
          .select("google_auth_secret")
          .eq("email", email)
          .single();
          
        if (securityError || !securityData?.google_auth_secret) {
          console.error("Error fetching secret:", securityError);
          return new Response(
            JSON.stringify({
              success: false,
              error: "User not found or 2FA not set up"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
            }
          );
        }
        
        // Create a TOTP object with the stored secret
        const totp = new OTPAuth.TOTP({
          issuer: "WillTank",
          label: email,
          secret: securityData.google_auth_secret,
          digits: 6,
          period: 30
        });
        
        // Verify the provided code
        const delta = totp.validate({ token: code, window: 1 });
        
        // delta is null if the code is invalid, otherwise it's the time step difference
        const isValid = delta !== null;
        
        if (isValid) {
          // Update the last successful 2FA authentication timestamp
          await supabase
            .from("user_security")
            .update({ 
              last_2fa_at: new Date().toISOString() 
            })
            .eq("email", email);
            
          // Update user profile to mark as logged in
          await supabase
            .from("user_profiles")
            .update({ 
              last_login: new Date().toISOString() 
            })
            .eq("email", email);
        }
        
        return new Response(
          JSON.stringify({
            success: isValid,
            error: isValid ? null : "Invalid authentication code"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: isValid ? 200 : 401,
          }
        );
      }
      
      case "validate": {
        // Validate a code during setup to ensure the user scanned the QR code correctly
        if (!code || !secret) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing code or secret"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        // Create a TOTP object with the provided secret
        const totp = new OTPAuth.TOTP({
          issuer: "WillTank",
          label: email || "user",
          secret,
          digits: 6,
          period: 30
        });
        
        // Verify the provided code
        const delta = totp.validate({ token: code, window: 1 });
        const isValid = delta !== null;
        
        if (isValid && userId) {
          // Store the secret in the database if validation is successful and userId is provided
          const { error: insertError } = await supabase
            .from("user_security")
            .upsert({
              user_id: userId,
              email,
              google_auth_enabled: true,
              google_auth_secret: secret
            });
            
          if (insertError) {
            console.error("Error storing 2FA secret:", insertError);
            return new Response(
              JSON.stringify({
                success: false,
                error: "Failed to store 2FA configuration"
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
              }
            );
          }
        }
        
        return new Response(
          JSON.stringify({
            success: isValid,
            error: isValid ? null : "Invalid verification code"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: isValid ? 200 : 401,
          }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid action"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
    }
  } catch (error) {
    console.error("Error in two-factor-auth function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
