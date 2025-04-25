
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { Logo } from "@/components/ui/logo/Logo";
import { SecurityTipsPanel } from "@/components/ui/security-tips-panel";
import { verifyCode, sendVerificationEmail } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client"; // Added missing import

export default function AccountVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const getStateFromLocation = () => {
    if (location.state?.email) {
      return location.state;
    }
    
    const params = new URLSearchParams(location.search);
    const email = params.get('email') || '';
    const isLogin = params.get('isLogin') === 'true';
    const message = params.get('message') || "We've sent a verification code to your email address. Please enter it below to complete your account setup.";
    
    return { email, isLogin, message };
  };

  const { email, isLogin, message } = getStateFromLocation();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    console.log("Setting up auth state listener in verification page");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in verification page:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("Detected sign in, will redirect to onboarding shortly");
        setTimeout(() => {
          console.log("Redirecting to onboarding now");
          navigate('/auth/onboarding', { replace: true });
        }, 1000);
      }
    });
    
    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleVerification = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Verifying code for:", email, "isLogin:", isLogin);
      
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
        setLoading(false);
        return;
      }

      toast({
        title: isLogin ? "Login successful!" : "Account verified successfully!",
        description: `Welcome${email ? ` ${email}` : ''} to WillTank.`,
      });
      
      console.log("Verification successful, auth data:", data);
      
      if (data?.authLink) {
        console.log("Received auth link, will manually navigate to onboarding after delay");
        setTimeout(() => {
          console.log("Manual navigation to onboarding");
          navigate('/auth/onboarding', { replace: true });
        }, 2000);
      }
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
    <div className="min-h-screen w-full bg-gray-950 flex">
      <div className="hidden md:flex md:w-1/2 bg-black relative overflow-hidden">
        <SecurityTipsPanel />
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="mb-6">
          <Logo size="lg" color="white" showSlogan />
        </div>
        
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-gray-800">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isLogin ? "Verify Your Login" : "Verify Your Account"}
            </h2>
            <p className="text-muted-foreground">
              {message}
            </p>
            {email && (
              <p className="text-sm font-medium text-blue-500">
                {email}
              </p>
            )}
          </motion.div>

          <div className="mt-8 space-y-4">
            <TwoFactorInput
              onSubmit={handleVerification}
              loading={loading}
              error={error}
            />

            <div className="space-y-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-foreground"
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
          </div>

          <motion.div
            className="mt-8 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>
              This additional step helps us keep your WillTank account secure.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
