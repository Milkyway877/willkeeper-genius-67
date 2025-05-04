
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup';
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  
  useEffect(() => {
    if (!email) {
      navigate('/auth/signin', { replace: true });
    }
  }, [email, navigate]);

  const handleVerification = async (code: string) => {
    if (!email) return;
    
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log("Verifying code:", code, "for email:", email);
      
      // First verify the code
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('type', type)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      console.log("Verification query result:", { data: verificationData, error: verificationError });

      if (verificationError || !verificationData) {
        toast({
          title: "Verification failed",
          description: "The code you entered is invalid or has expired. Please try again or request a new code.",
          variant: "destructive",
        });
        
        if (verificationAttempts >= 3) {
          toast({
            title: "Too many attempts",
            description: "Please request a new verification code.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      // Mark code as used
      await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id);

      if (type === 'signup') {
        // For signup flow - update user profile to mark activation as complete
        await supabase
          .from('user_profiles')
          .update({ activation_complete: true, email_verified: true, is_activated: true })
          .eq('email', email);
        
        // Get credentials from session storage
        const storedEmail = sessionStorage.getItem('auth_email');
        const storedPassword = sessionStorage.getItem('auth_password');
        
        if (storedEmail && storedPassword) {
          // Sign in the user
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (authError) {
            toast({
              title: "Sign in failed",
              description: authError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
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
          // Sign in the user
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (authError) {
            toast({
              title: "Sign in failed",
              description: authError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
          
          // Update user profile to mark email as verified
          await supabase
            .from('user_profiles')
            .update({ email_verified: true, is_activated: true })
            .eq('email', email);
          
          toast({
            title: "Login successful",
            description: "You have been successfully verified and logged in.",
            variant: "default",
          });
          
          // Navigate to dashboard with replace to prevent back navigation to login
          navigate('/dashboard', { replace: true });
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
      console.error('Error during email verification:', error);
      toast({
        title: "Verification error",
        description: error.message || "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setResendLoading(true);
    
    try {
      // Generate a new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log("Resending verification code to:", email);
      
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
      
      // Store verification code
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
      
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
      
      // Reset the form
      setVerificationCode('');
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
          <TwoFactorInput 
            onSubmit={handleVerification}
            loading={isLoading}
            value={verificationCode}
            onChange={setVerificationCode}
            autoSubmit={false}
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
