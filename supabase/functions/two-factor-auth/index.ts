
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
        if ((!email && !userId) || !code) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing email/userId or code"
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
        
        // Try getting the user's secret from the database, first by email
        let securityData = null;
        let securityError = null;
        
        if (email) {
          const securityResult = await supabase
            .from("user_security")
            .select("google_auth_secret, user_id")
            .eq("email", email)
            .maybeSingle();
            
          securityData = securityResult.data;
          securityError = securityResult.error;
        }
        
        // If email lookup failed or returned no results, try with userId
        if ((!securityData || securityError) && userId) {
          console.log("Email lookup failed, trying userId:", userId);
          
          const securityByIdResult = await supabase
            .from("user_security")
            .select("google_auth_secret, email")
            .eq("user_id", userId)
            .maybeSingle();
            
          securityData = securityByIdResult.data;
          securityError = securityByIdResult.error;
          
          // If we found a record by user_id but it's missing the email, update it
          if (securityData && !securityData.email && email) {
            await supabase
              .from("user_security")
              .update({ email })
              .eq("user_id", userId);
          }
        }
          
        if (securityError || !securityData?.google_auth_secret) {
          console.error("Error fetching secret:", securityError || "Secret not found");
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
          label: email || "user",
          secret: securityData.google_auth_secret,
          digits: 6,
          period: 30
        });
        
        // Verify the provided code
        const delta = totp.validate({ token: code, window: 1 });
        
        // delta is null if the code is invalid, otherwise it's the time step difference
        const isValid = delta !== null;
        
        if (isValid) {
          // Get the actual user_id to update records
          const userIdToUpdate = securityData.user_id || userId;
          
          if (userIdToUpdate) {
            // Update the last successful 2FA authentication timestamp
            await supabase
              .from("user_security")
              .update({ 
                last_2fa_at: new Date().toISOString() 
              })
              .eq("user_id", userIdToUpdate);
              
            // Update user profile to mark as logged in
            if (email) {
              await supabase
                .from("user_profiles")
                .update({ 
                  last_login: new Date().toISOString() 
                })
                .eq("email", email);
            } else {
              await supabase
                .from("user_profiles")
                .update({ 
                  last_login: new Date().toISOString() 
                })
                .eq("id", userIdToUpdate);
            }
          }
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
          // Check if a record already exists for this user
          const { data: existingRecord } = await supabase
            .from("user_security")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
          
          if (existingRecord) {
            // Update existing record
            const { error: updateError } = await supabase
              .from("user_security")
              .update({
                email,
                google_auth_enabled: true,
                google_auth_secret: secret
              })
              .eq("user_id", userId);
              
            if (updateError) {
              console.error("Error updating 2FA settings:", updateError);
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "Failed to update 2FA configuration"
                }),
                {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                  status: 500,
                }
              );
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from("user_security")
              .insert({
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
