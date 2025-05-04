
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  generateVerificationCode, 
  storeVerificationCode, 
  verifyCode, 
  logVerificationEvent,
  updateUserSecurityProfile,
  getSupabaseClient
} from "../_shared/auth-helper.ts";
import { sendVerificationEmail } from "../_shared/email-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, email, code, type, userId, deviceInfo } = await req.json();
    
    if (!action) {
      throw new Error("Missing required 'action' field");
    }
    
    // Send verification code
    if (action === "send_code") {
      if (!email || !type) {
        throw new Error("Email and type are required for sending verification codes");
      }
      
      console.log(`Sending ${type} verification code to ${email}`);
      
      // Generate a verification code
      const verificationCode = generateVerificationCode();
      
      // Store the code in the database
      const storedCode = await storeVerificationCode(email, verificationCode, type);
      if (!storedCode) {
        throw new Error("Failed to store verification code");
      }
      
      // Send the email
      const emailResult = await sendVerificationEmail(email, verificationCode, type);
      
      // Log the event
      await logVerificationEvent(email, type, "code_sent", {
        success: emailResult.success,
        messageId: emailResult.messageId,
        error: emailResult.error,
        timestamp: new Date().toISOString()
      });
      
      if (!emailResult.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: emailResult.error || "Failed to send verification email" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Verification code sent successfully"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Verify code
    else if (action === "verify_code") {
      if (!email || !code || !type) {
        throw new Error("Email, code and type are required for verification");
      }
      
      console.log(`Verifying ${type} code for ${email}`);
      
      // Verify the code
      const verification = await verifyCode(email, code, type);
      
      // Log the verification attempt
      await logVerificationEvent(email, type, verification.isValid ? "code_verified" : "code_invalid", {
        success: verification.isValid,
        message: verification.message,
        timestamp: new Date().toISOString()
      });
      
      if (!verification.isValid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: verification.message || "Invalid verification code" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
      
      // If verification is for login/signup and we have userId, update security profile
      if ((type === "login" || type === "signup") && userId) {
        await updateUserSecurityProfile(userId, {
          last_verified: new Date().toISOString(),
          failed_login_attempts: 0,
          known_devices: deviceInfo ? [deviceInfo] : undefined
        });
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Code verified successfully"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Update security settings
    else if (action === "update_security" && userId) {
      if (!userId) {
        throw new Error("User ID is required for updating security settings");
      }
      
      const updateResult = await updateUserSecurityProfile(userId, {
        ...req.json(), // Pass all fields from request
        updated_at: new Date().toISOString()
      });
      
      if (!updateResult) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Failed to update security settings" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Security settings updated successfully"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    else {
      throw new Error(`Invalid action: ${action}`);
    }
    
  } catch (error) {
    console.error("Error in auth function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
