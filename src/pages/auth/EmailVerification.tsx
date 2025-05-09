import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { VerificationCodeInput } from '@/components/ui/VerificationCodeInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup';
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!email) {
      navigate('/auth/signin', { replace: true });
      return;
    }
    
    // Clean up any previous errors
    setVerificationError(null);
  }, [email, navigate]);

  const handleVerifyCode = async (code: string) => {
    if (!email) return;
    
    // Reset error state
    setVerificationError(null);
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log(`Verifying code: ${code} for email: ${email} type: ${type}`);
      
      // First try using DB function (will fail gracefully if function doesn't exist)
      const { data: functionResult, error: functionError } = await supabase.rpc(
        'is_verification_code_valid',
        { check_email: email, check_code: code, check_type: type }
      );
      
      // Track verification status
      let isCodeValid = false;
      let verificationData = null;
      
      console.log("DB function verification result:", { result: functionResult, error: functionError });
      
      // If function check worked and returned true, code is valid
      if (!functionError && functionResult === true) {
        isCodeValid = true;
        console.log("Code verified through database function");
      } 
      // Otherwise fall back to direct query
      else {
        console.log("Using fallback verification method");
        
        // Get the current server timestamp to avoid timezone issues
        const { data: timeData } = await supabase.rpc('get_current_timestamp');
        const serverNow = timeData || new Date().toISOString();
        
        console.log("Server timestamp for verification:", serverNow);
        
        const { data, error } = await supabase
          .from('email_verification_codes')
          .select('*')
          .eq('email', email)
          .eq('code', code)
          .eq('type', type)
          .eq('used', false)
          .gt('expires_at', serverNow)
          .order('created_at', { ascending: false })
          .maybeSingle();
          
        console.log("Fallback verification query result:", { data, error });
        
        if (error) {
          console.error("Verification query error:", error);
          throw new Error(error.message || "Database error during verification");
        }
        
        if (!data) {
          throw new Error("Invalid or expired verification code");
        }
        
        // If we get here, the code is valid
        verificationData = data;
        isCodeValid = true;
      }
      
      // If code is valid, mark it as used and proceed with verification
      if (isCodeValid) {
        // Find the code record if we don't have it yet
        if (!verificationData) {
          const { data, error } = await supabase
            .from('email_verification_codes')
            .select('id')
            .eq('email', email)
            .eq('code', code)
            .eq('type', type)
            .eq('used', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (error || !data) {
            console.warn("Found valid code but couldn't retrieve record:", error || "No data returned");
          } else {
            verificationData = data;
          }
        }
        
        // Mark code as used if we found a record
        if (verificationData?.id) {
          console.log("Marking code as used:", verificationData.id);
          const { error: updateError } = await supabase
            .from('email_verification_codes')
            .update({ used: true })
            .eq('id', verificationData.id);
          
          if (updateError) {
            console.warn("Error marking code as used:", updateError);
            // Continue anyway since verification succeeded
          }
        }
        
        // Handle successful verification based on type
        await handleSuccessfulVerification();
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      
      // Set user-friendly error message
      let errorMessage = "The verification code is invalid or has expired. Please try again or request a new code.";
      
      if (error?.message) {
        if (error.message.includes("function") || error.message.includes("does not exist")) {
          errorMessage = "Verification system is temporarily unavailable. Please try again later.";
          console.error("Database function is missing - admin should check migrations");
        } else if (error.message.includes("permission") || error.message.includes("policy")) {
          errorMessage = "Access denied. Please contact support.";
          console.error("RLS policy issue detected - admin should check migrations");
        }
      }
      
      // Display error to user
      setVerificationError(errorMessage);
      
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (verificationAttempts >= 3) {
        toast({
          title: "Too many attempts",
          description: "Please request a new verification code.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuccessfulVerification = async () => {
    try {
      if (type === 'signup') {
        // For signup flow - update user profile to mark email as verified
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            email_verified: true 
          })
          .eq('email', email);
        
        if (profileError) {
          console.error("Error updating user profile:", profileError);
          toast({
            title: "Verification error",
            description: "Your email was verified, but we couldn't update your profile. Please contact support.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. You can now login to your account.",
          variant: "default",
        });
        
        // Direct to signin after successful signup verification
        navigate('/auth/signin', { replace: true });
      } else if (type === 'login') {
        // For login flow, get email from session storage
        const storedEmail = sessionStorage.getItem('auth_email');
        
        if (storedEmail) {
          // Update user profile to mark login verification successful
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('email', email);
            
          if (profileError) {
            console.error("Error updating login timestamp:", profileError);
          }
            
          // Clear stored email
          sessionStorage.removeItem('auth_email');
          
          toast({
            title: "Verification successful",
            description: "You have been successfully verified.",
            variant: "default",
          });
          
          // After login verification, redirect to sign in to require full credentials
          navigate('/auth/signin?verified=true', { replace: true });
        } else {
          toast({
            title: "Authentication error",
            description: "Login session expired. Please log in again.",
            variant: "destructive",
          });
          navigate('/auth/signin', { replace: true });
        }
      }
    } catch (error: any) {
      console.error("Error during post-verification process:", error);
      toast({
        title: "Verification error",
        description: error.message || "An unexpected error occurred after verification. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setVerificationError(null);
    
    try {
      // Generate a new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log(`Resending verification code to: ${email} type: ${type}`);
      
      // Send verification email using Edge Function
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: {
          email,
          code: verificationCode,
          type
        }
      });
      
      console.log("Email function response:", data);
      
      if (error) {
        console.error("Error invoking send-verification function:", error);
        throw new Error("Failed to send verification code");
      }
      
      // Reset verification attempts
      setVerificationAttempts(0);
      
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      console.error("Error resending code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send a new code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a verification code to ${email}. Please enter the code below to ${type === 'signup' ? 'complete your registration' : 'verify your login'}.`}
      rightPanel={<VerificationInfoPanel />}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Verification Code</Label>
            <VerificationCodeInput 
              onSubmit={handleVerifyCode}
              loading={isLoading}
              autoSubmit={false}
              error={verificationError}
            />
            
            {verificationError && (
              <div className="flex items-start text-sm text-red-500 mt-2">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Didn't receive a code?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={handleResendCode}
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </Button>
            </p>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}

// Import the VerificationInfoPanel component from its file
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';
