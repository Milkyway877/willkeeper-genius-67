
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { TOTP } from "https://deno.land/x/authenticator@v0.10.0/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TwoFactorRequest {
  action: "setup" | "verify" | "disable" | "generateSecret";
  code?: string;
  secret?: string;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request data
    const requestData: TwoFactorRequest = await req.json();
    const { action, code, secret, userId } = requestData;
    
    console.log(`Processing ${action} request for user ${userId}`);
    
    // Verify authentication unless it's a preflight request
    const authHeader = req.headers.get("Authorization");
    let authenticatedUserId = "";
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      authenticatedUserId = user.id;
    }
    
    // For all actions except generateSecret, verify the user is authenticated
    if (action !== "generateSecret" && (!authenticatedUserId || (userId && authenticatedUserId !== userId))) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let responseData = {};
    
    switch (action) {
      case "generateSecret":
        const newSecret = generateRandomBase32(20);
        const userEmail = userId ? await getUserEmail(supabase, userId) : "user";
        const qrCodeUrl = generateTotpUrl(newSecret, userEmail);
        
        console.log("Generated new TOTP secret:", newSecret);
        console.log("Generated QR code URL:", qrCodeUrl);
        
        responseData = { success: true, secret: newSecret, qrCodeUrl };
        break;
        
      case "setup":
        if (!code || !secret || !userId) {
          return new Response(
            JSON.stringify({ error: "Missing required parameters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Validate the code against the provided secret
        const isValid = verifyTOTP(code, secret);
        
        if (!isValid) {
          responseData = { 
            success: false, 
            error: "Invalid verification code" 
          };
          break;
        }
        
        // Store the 2FA settings in the database
        const setupResult = await setupTwoFactor(supabase, userId, secret);
        responseData = setupResult;
        break;
        
      case "verify":
        if (!code || !userId) {
          return new Response(
            JSON.stringify({ error: "Missing required parameters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get the user's 2FA secret from the database
        const { data: securityData, error: securityError } = await supabase
          .from("user_security")
          .select("google_auth_secret")
          .eq("user_id", userId)
          .maybeSingle();
          
        if (securityError || !securityData) {
          console.error("Error getting security data:", securityError);
          responseData = { 
            success: false, 
            error: "Failed to get security data" 
          };
          break;
        }
        
        const storedSecret = securityData.google_auth_secret;
        if (!storedSecret) {
          responseData = { 
            success: false, 
            error: "Two-factor authentication not set up for this user" 
          };
          break;
        }
        
        // Verify the code against the stored secret
        const isValidCode = verifyTOTP(code, storedSecret);
        responseData = { 
          success: isValidCode,
          error: isValidCode ? null : "Invalid verification code"
        };
        break;
        
      case "disable":
        if (!code || !userId) {
          return new Response(
            JSON.stringify({ error: "Missing required parameters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get the user's 2FA secret from the database
        const { data: userData, error: userError } = await supabase
          .from("user_security")
          .select("google_auth_secret")
          .eq("user_id", userId)
          .maybeSingle();
          
        if (userError || !userData || !userData.google_auth_secret) {
          console.error("Error getting user security data:", userError);
          responseData = { 
            success: false, 
            error: "Failed to get security data or 2FA not set up" 
          };
          break;
        }
        
        // Verify the code against the stored secret
        const isValidDisableCode = verifyTOTP(code, userData.google_auth_secret);
        
        if (!isValidDisableCode) {
          responseData = { 
            success: false, 
            error: "Invalid verification code" 
          };
          break;
        }
        
        // Disable 2FA in the database
        const { error: disableError } = await supabase
          .from("user_security")
          .update({ 
            google_auth_enabled: false 
          })
          .eq("user_id", userId);
          
        if (disableError) {
          console.error("Error disabling 2FA:", disableError);
          responseData = { 
            success: false, 
            error: "Database error when disabling 2FA" 
          };
          break;
        }
        
        responseData = { success: true };
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to generate a random base32 string
function generateRandomBase32(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// Helper function to generate a TOTP URL for QR codes
function generateTotpUrl(secret: string, email: string): string {
  const issuer = "WillTank";
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`;
}

// Helper function to verify a TOTP code
function verifyTOTP(code: string, secret: string): boolean {
  try {
    // Clean up inputs
    const cleanCode = code.replace(/\s+/g, "");
    const cleanSecret = secret.replace(/\s+/g, "");
    
    if (!cleanCode || cleanCode.length !== 6 || !/^\d+$/.test(cleanCode)) {
      return false;
    }
    
    // Create TOTP object with the secret
    const totp = new TOTP({
      secret: cleanSecret,
      digits: 6,
      algorithm: "SHA1",
      period: 30,
    });
    
    // Verify with a window of 1 to allow for clock drift
    return totp.verify(cleanCode, { window: 1 });
  } catch (error) {
    console.error("Error verifying TOTP:", error);
    return false;
  }
}

// Helper function to set up 2FA for a user
async function setupTwoFactor(supabase, userId: string, secret: string) {
  try {
    // Check if a security record already exists
    const { data: existingRecord, error: checkError } = await supabase
      .from("user_security")
      .select("id, encryption_key")
      .eq("user_id", userId)
      .maybeSingle();
    
    const encryptionKey = existingRecord?.encryption_key || generateRandomString(32);
    
    // Use upsert to handle both insert and update cases
    const { error: upsertError } = await supabase
      .from("user_security")
      .upsert({
        user_id: userId,
        google_auth_enabled: true,
        google_auth_secret: secret,
        encryption_key: encryptionKey
      }, { onConflict: "user_id" });
    
    if (upsertError) {
      console.error("Error updating security record:", upsertError);
      return { success: false, error: "Database error: " + upsertError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return { success: false, error: "Unexpected error: " + error.message };
  }
}

// Helper function to generate a random string
function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// Helper function to get user email
async function getUserEmail(supabase, userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("id", userId)
      .single();
      
    if (error || !data) {
      console.error("Error getting user email:", error);
      return "user";
    }
    
    return data.email || "user";
  } catch (error) {
    console.error("Error getting user email:", error);
    return "user";
  }
}
