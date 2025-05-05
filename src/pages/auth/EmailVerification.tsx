
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { EmailVerificationInput } from '@/components/ui/EmailVerificationInput';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup';
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!email) {
      console.log("No email found in URL params, redirecting to signin");
      navigate('/auth/signin', { replace: true });
    }
  }, [email, navigate]);

  const handleVerification = async (code: string) => {
    if (!email) {
      console.error("No email found, cannot verify");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log(`Verifying code "${code}" for email "${email}" with type "${type}"`);
      
      // Simplified query - just look for a valid code matching the email
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      console.log("Verification query result:", { data: verificationData, error: verificationError });

      if (verificationError) {
        console.error("Database error when fetching verification code:", verificationError);
        setError("Unable to verify code due to a system error. Please try again later.");
        return;
      }
      
      if (!verificationData || verificationData.length === 0) {
        console.log("No valid verification code found for the entered code");
        
        // Check if there are any codes (valid or expired) for this email to give better error messages
        const { data: anyCodes } = await supabase
          .from('email_verification_codes')
          .select('*')
          .eq('email', email)
          .eq('code', code)
          .limit(1);
        
        if (anyCodes && anyCodes.length > 0) {
          if (new Date(anyCodes[0].expires_at) < new Date()) {
            setError("This verification code has expired. Please request a new code.");
          } else if (anyCodes[0].used) {
            setError("This code has already been used. Please request a new code.");
          } else {
            setError("Invalid verification code. Please check and try again.");
          }
        } else {
          setError("The code you entered doesn't match our records. Please try again.");
        }
        
        if (verificationAttempts >= 3) {
          setError("Too many attempts. Please request a new verification code.");
        }
        return;
      }

      const latestVerification = verificationData[0];
      console.log("Valid verification record found:", latestVerification);
      
      // Mark code as used
      const { error: updateError } = await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', latestVerification.id);
        
      if (updateError) {
        console.error("Error marking code as used:", updateError);
        // Continue anyway as the verification was successful
      }

      if (type === 'signup') {
        // For signup flow - update user profile to mark activation as complete
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ activation_complete: true, email_verified: true, is_activated: true })
          .eq('email', email);
          
        if (profileError) {
          console.error("Error updating user profile:", profileError);
        }
        
        // Get credentials from session storage
        const storedEmail = sessionStorage.getItem('auth_email');
        const storedPassword = sessionStorage.getItem('auth_password');
        
        if (storedEmail && storedPassword) {
          // Sign in the user
          console.log("Signing in user after successful verification");
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (authError) {
            console.error("Auth error during sign-in after verification:", authError);
            setError(authError.message || "Sign in failed after verification");
            return;
          }
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
          
          console.log("User signed in successfully after verification:", authData);
        } else {
          console.warn("No stored credentials found for automatic login");
        }
        
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. Welcome to WillTank!",
          variant: "default",
        });
        
        // Direct to dashboard after successful signup verification
        navigate('/dashboard', { replace: true });
      } else {
        // For login flow
        // Get credentials from session storage
        const storedEmail = sessionStorage.getItem('auth_email');
        const storedPassword = sessionStorage.getItem('auth_password');
        
        if (storedEmail && storedPassword) {
          console.log("Attempting sign in with stored credentials");
          // Sign in the user
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (authError) {
            console.error("Auth error during sign-in after verification:", authError);
            setError(authError.message || "Sign in failed after verification");
            return;
          }
          
          console.log("Sign in successful, user authenticated");
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
          
          // Update user profile to mark email as verified
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ email_verified: true, is_activated: true })
            .eq('email', email);
          
          if (profileError) {
            console.error("Error updating user profile:", profileError);
          }
          
          toast({
            title: "Login successful",
            description: "You have been successfully verified and logged in.",
            variant: "default",
          });
          
          // Navigate to dashboard with replace to prevent back navigation to login
          navigate('/dashboard', { replace: true });
        } else {
          console.error("No stored credentials found");
          setError("Login session expired. Please log in again.");
        }
      }
    } catch (error: any) {
      console.error('Error during email verification:', error);
      setError(error.message || "An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setError(null);
    
    try {
      // Generate a new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log("Resending verification code to:", email);
      
      // Delete expired codes first to clean up
      await supabase
        .from('email_verification_codes')
        .delete()
        .eq('email', email)
        .lt('expires_at', new Date().toISOString());
      
      // Store verification code with proper expiration
      const { error: storeError } = await supabase
        .from('email_verification_codes')
        .insert({
          email: email,
          code: verificationCode,
          type: type,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiry
          used: false
        });
      
      if (storeError) {
        console.error("Error storing verification code:", storeError);
        throw new Error("Failed to process verification");
      }
      
      // Send verification email
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification', {
        body: {
          email: email,
          code: verificationCode,
          type: type
        }
      });
      
      console.log("Email function response:", { data: emailData, error: emailError });
      
      if (emailError) {
        console.error("Error invoking send-verification function:", emailError);
        throw new Error("Failed to send verification code");
      }
      
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
      
      // Reset the form and attempts
      setVerificationCode('');
      setVerificationAttempts(0);
    } catch (error: any) {
      console.error("Error resending code:", error);
      setError(error.message || "Failed to send a new code. Please try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a verification code to ${email}. Please enter the code below to ${type === 'signup' ? 'complete your registration' : 'login'}.`}
      rightPanel={<VerificationInfoPanel />}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="space-y-6">
          <EmailVerificationInput 
            onSubmit={handleVerification}
            loading={isLoading}
            value={verificationCode}
            onChange={setVerificationCode}
            autoSubmit={false}
            error={error}
          />

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
