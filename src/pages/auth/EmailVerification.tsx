
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createWelcomeNotification } from '@/services/notificationService';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Redirect to signup if no email is provided
      navigate('/auth/signup');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerification = async (code: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // Use signInWithOtp to verify the code
      const { data, error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (signInError) {
        setError("Invalid verification code. Please try again.");
        setLoading(false);
        return;
      }

      // Create welcome notification for new user
      await createWelcomeNotification();

      toast({
        title: "Email verified!",
        description: "Your account has been activated successfully.",
      });

      // Navigate to dashboard after successful verification
      navigate('/dashboard');
    } catch (err) {
      console.error("Error during verification:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendLoading || countdown > 0) return;
    setResendLoading(true);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (resendError) {
        setError(resendError.message);
        setResendLoading(false);
        return;
      }

      toast({
        title: "Verification email sent",
        description: "Please check your inbox for a new verification link.",
      });

      // Set cooldown for resend button
      setCountdown(60);
    } catch (err) {
      console.error("Error resending verification email:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your email address to verify your account"
      rightPanel={<SecurityInfoPanel />}
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-center text-muted-foreground mb-2">
            We've sent a verification code to:
          </p>
          <p className="text-center font-medium mb-6">{email}</p>
        </div>

        <TwoFactorInput 
          onSubmit={handleVerification} 
          loading={loading}
          error={error}
        />

        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleResendCode}
            disabled={resendLoading || countdown > 0}
          >
            {resendLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : countdown > 0 ? (
              `Resend code (${countdown}s)`
            ) : (
              "Resend verification code"
            )}
          </Button>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={() => navigate('/auth/signin')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
