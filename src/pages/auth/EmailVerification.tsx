
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup';
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!email) {
      navigate('/auth/signin', { replace: true });
    }
  }, [email, navigate]);

  const handleVerifyCode = async (code: string) => {
    if (!email) return;
    
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log("Verifying code:", code, "for email:", email, "type:", type);
      
      // First verify the code - fixed timestamp comparison
      const now = new Date().toISOString();
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('type', type)
        .eq('used', false)
        .gte('expires_at', now) // Changed direction to check if expiration is in future
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log("Verification query result:", { 
        data: verificationData, 
        error: verificationError,
        currentTime: now,
      });

      if (verificationError || !verificationData) {
        let errorMessage = "The verification code is invalid or has expired. Please try again or request a new code.";
        
        if (verificationError?.code === 'PGRST116') {
          errorMessage = "Verification code not found. Please check the code and try again.";
        } else if (verificationError?.message?.includes('expires_at')) {
          errorMessage = "This verification code has expired. Please request a new one.";
        }
        
        console.error("Verification failed:", verificationError || "No verification data found");
        
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
        setIsLoading(false);
        return;
      }

      // Mark code as used
      const { error: updateError } = await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id);
      
      if (updateError) {
        console.error("Error marking code as used:", updateError);
        // Continue with verification even if marking as used fails
      }

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
          setIsLoading(false);
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
      
      console.log("Resending verification code to:", email, "type:", type);
      
      // Send verification email using Edge Function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification', {
        body: {
          email: email,
          code: verificationCode,
          type: type
        }
      });
      
      console.log("Email function response:", emailData);
      
      if (emailError) {
        console.error("Error invoking send-verification function:", emailError);
        throw new Error("Failed to send verification code");
      }
      
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
            <TwoFactorInput 
              onSubmit={handleVerifyCode}
              loading={isLoading}
              autoSubmit={false}
            />
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
