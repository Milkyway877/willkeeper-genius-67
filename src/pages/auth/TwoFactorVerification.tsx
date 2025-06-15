import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateTOTP, getUserSecurity } from '@/services/encryptionService';
import { toast } from '@/hooks/use-toast';

export default function TwoFactorVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetFlowActive, setResetFlowActive] = useState(false);

  useEffect(() => {
    // Check if coming from the reset flow (password recovery)
    if (location.state && location.state.resetFlow && location.state.userId) {
      setResetUserId(location.state.userId);
      setResetFlowActive(true);
      setUserEmail("");
      return;
    }

    const checkAuthState = async () => {
      const email = searchParams.get('email') || sessionStorage.getItem('auth_email');
      
      if (!email) {
        navigate('/auth/signin', { replace: true });
        return;
      }
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not authenticated, redirect to sign in
        navigate('/auth/signin', { replace: true });
        return;
      }
      
      setUserEmail(email);
    };
    
    checkAuthState();
  }, [searchParams, navigate, location.state]);

  const handleVerification = async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      // For reset flow we need to manually get the secret
      let userId = resetFlowActive && resetUserId ? resetUserId : null;

      if (resetFlowActive && userId) {
        // Lookup user_security by userId
        const { data: security, error } = await supabase
          .from("user_security")
          .select("google_auth_secret")
          .eq("user_id", userId)
          .maybeSingle();

        if (error || !security?.google_auth_secret) {
          setError('2FA not properly configured for this account.');
          return;
        }

        const isValid = await validateTOTP(code, security.google_auth_secret);
        if (!isValid) {
          setError('Invalid verification code. Please try again.');
          return;
        }

        // Next step: Go to password reset form and pass userId
        navigate('/auth/direct-password-reset', { state: { userId } });
        return;
      }

      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication session expired. Please sign in again.');
      }

      // Get user's 2FA secret
      const security = await getUserSecurity();
      if (!security?.google_auth_secret) {
        throw new Error('2FA not properly configured. Please contact support.');
      }

      // Validate the TOTP code
      const isValid = await validateTOTP(code, security.google_auth_secret);
      
      if (!isValid) {
        setError('Invalid verification code. Please try again.');
        return;
      }
      sessionStorage.removeItem('auth_email');
      toast({
        title: "Login successful",
        description: "You've been signed in successfully with 2FA verification.",
      });
      navigate('/dashboard', { replace: true });

    } catch (error: any) {
      console.error('2FA verification error:', error);
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    sessionStorage.removeItem('auth_email');
    // Sign out the user before going back to sign in
    supabase.auth.signOut();
    navigate('/auth/signin', { replace: true });
  };

  return (
    <AuthLayout 
      title="Two-Factor Authentication" 
      subtitle={
        resetFlowActive 
          ? "Enter the 6-digit code from your authenticator app to verify your identity for password reset"
          : "Enter the 6-digit code from your authenticator app"
      }
      rightPanel={<SecurityInfoPanel mode="verification" />}
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 bg-willtank-50 rounded-full mb-4">
            <Shield className="h-6 w-6 text-willtank-600" />
          </div>
          {resetFlowActive
            ? <p className="text-sm text-gray-600">
                Please verify your identity for password reset
              </p>
            : <p className="text-sm text-gray-600">
                We've sent a verification code to your authenticator app for <strong>{userEmail}</strong>
              </p>
          }
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <TwoFactorInput 
            onSubmit={handleVerification}
            loading={loading}
            error={error}
            autoSubmit={true}
          />
        </div>

        {!resetFlowActive &&
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => {
              sessionStorage.removeItem('auth_email');
              supabase.auth.signOut();
              navigate('/auth/signin', { replace: true });
            }}
            className="text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </div>}

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact support for assistance with your authenticator app.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
