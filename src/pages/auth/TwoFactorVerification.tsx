
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const checkAuthState = async () => {
      const email = searchParams.get('email') || sessionStorage.getItem('auth_email');
      
      if (!email) {
        // No email provided, redirect back to sign in
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
  }, [searchParams, navigate]);

  const handleVerification = async (code: string) => {
    try {
      setLoading(true);
      setError(null);

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

      // Clear stored email
      sessionStorage.removeItem('auth_email');
      
      toast({
        title: "Login successful",
        description: "You've been signed in successfully with 2FA verification.",
      });

      // Navigate to dashboard (user is already authenticated)
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
      subtitle="Enter the 6-digit code from your authenticator app"
      rightPanel={<SecurityInfoPanel mode="verification" />}
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 bg-willtank-50 rounded-full mb-4">
            <Shield className="h-6 w-6 text-willtank-600" />
          </div>
          <p className="text-sm text-gray-600">
            We've sent a verification code to your authenticator app for <strong>{userEmail}</strong>
          </p>
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

        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBackToSignIn}
            className="text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact support for assistance with your authenticator app.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
