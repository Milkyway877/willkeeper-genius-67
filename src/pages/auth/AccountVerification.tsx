
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { fadeInUp } from '@/components/auth/animations';
import { useToast } from "@/hooks/use-toast";
import { verifyCode, sendVerificationEmail } from "@/services/authService";
import { supabase } from '@/integrations/supabase/client';

export default function AccountVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get email and isLogin from location state or URL parameters
  const getStateFromLocation = () => {
    // First try to get from location state
    if (location.state?.email) {
      return location.state;
    }
    
    // Otherwise try to parse from URL parameters
    const params = new URLSearchParams(location.search);
    const email = params.get('email') || '';
    const isLogin = params.get('isLogin') === 'true';
    const message = params.get('message') || "We've sent a verification code to your email address. Please enter it below to complete your account setup.";
    
    return { email, isLogin, message };
  };

  const { email, isLogin, message } = getStateFromLocation();

  // Set up cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Set up auth state change listener to handle successful verification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in verification page:", event);
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        // Redirect to onboarding after successful verification and sign in
        setTimeout(() => {
          navigate('/auth/onboarding', { replace: true });
        }, 500);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleVerification = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Verifying code for:", email, "isLogin:", isLogin);
      
      // Call the verify code endpoint
      const { data, error: verifyError } = await verifyCode({ 
        email, 
        code,
        isLogin
      });

      if (verifyError) {
        setError(verifyError);
        toast({
          title: "Verification failed",
          description: verifyError,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: isLogin ? "Login successful!" : "Account verified successfully!",
        description: `Welcome${email ? ` ${email}` : ''} to WillTank.`,
      });
      
      console.log("Verification successful, waiting for auth state change");
      // The auth state listener will handle the redirect
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
      toast({
        title: "Verification error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      console.log("Resending code to:", email, "isLogin:", isLogin);
      
      const { data, error: sendError } = await sendVerificationEmail({
        email,
        isLogin
      });

      if (sendError) {
        toast({
          title: "Failed to resend code",
          description: sendError,
          variant: "destructive"
        });
        return;
      }

      // Set cooldown for 60 seconds
      setResendCooldown(60);

      toast({
        title: "Verification code resent",
        description: `We've sent a new code to ${email || 'your email address'}.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to resend code",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(isLogin ? '/auth/login' : '/auth/signup');
  };

  return (
    <AuthLayout title={isLogin ? "Verify Your Login" : "Verify Your Account"}>
      <motion.div
        className="w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon and Description */}
        <motion.div 
          className="text-center space-y-4"
          variants={fadeInUp}
        >
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-muted-foreground">
            {message}
          </p>
          {email && (
            <p className="text-sm font-medium text-blue-500">
              {email}
            </p>
          )}
        </motion.div>

        {/* Verification Code Input */}
        <motion.div 
          className="space-y-4"
          variants={fadeInUp}
        >
          <TwoFactorInput
            onSubmit={handleVerification}
            loading={loading}
            error={error}
          />

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
            >
              <Mail className="mr-2 h-4 w-4" />
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : 'Resend verification code'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoBack}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {isLogin ? 'login' : 'signup'}
            </Button>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.div
          className="mt-8 text-center text-sm text-muted-foreground"
          variants={fadeInUp}
        >
          <p>
            This additional step helps us keep your WillTank account secure.
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
