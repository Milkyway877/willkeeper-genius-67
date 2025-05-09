import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Shield, Info, AlertTriangle } from 'lucide-react';
import { VerificationCodeInput } from '@/components/ui/VerificationCodeInput';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';
import { QRCode } from '@/components/ui/QRCode';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [is2FASetup, setIs2FASetup] = useState<boolean | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('auth_email');
    if (!storedEmail) {
      navigate('/auth/signin', { replace: true });
      return;
    }
    
    setEmail(storedEmail);
    
    // Check if user has 2FA enabled
    const checkUserSecurity = async () => {
      try {
        setIsLoading(true);
        const { data: securityData, error } = await supabase
          .from('user_security')
          .select('google_auth_enabled, google_auth_secret')
          .eq('email', storedEmail)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking 2FA status:', error);
          return;
        }
        
        // If 2FA is already set up
        if (securityData?.google_auth_enabled && securityData?.google_auth_secret) {
          setIs2FASetup(true);
        } else {
          // If 2FA is not set up, we need to generate a new secret
          setIs2FASetup(false);
          
          // Only show setup if the user explicitly clicks to set up
          setShowSetup(false);
          
          // Generate secret for setup
          if (!showSetup) {
            const { data, error } = await supabase.functions.invoke('two-factor-auth', {
              body: { 
                action: 'generate',
                email: storedEmail
              }
            });
            
            if (error || !data?.success) {
              console.error('Error generating 2FA secret:', error || data?.error);
              return;
            }
            
            setQrCodeUrl(data.qrCodeUrl);
            setSecretKey(data.secret);
          }
        }
      } catch (error) {
        console.error('Error in checkUserSecurity:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserSecurity();
  }, [navigate, showSetup]);

  const handleVerifyOTP = async (code: string) => {
    if (!email) return;
    
    // Reset error state
    setVerificationError(null);
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log(`Verifying Google Auth code for email: ${email}`);
      
      // Call our edge function to verify the OTP
      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: {
          action: 'verify',
          email: email,
          code: code
        }
      });
      
      if (error || !data?.success) {
        console.error("Error verifying OTP:", error || data?.error);
        throw new Error(data?.error || "Invalid verification code");
      }
      
      // Authentication successful, redirect to dashboard
      toast({
        title: "Authentication successful",
        description: "You have been successfully authenticated.",
        variant: "default",
      });
      
      // Clear email from session storage
      sessionStorage.removeItem('auth_email');
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      
      // Set user-friendly error message
      let errorMessage = "The verification code is invalid. Please try again.";
      
      if (error?.message) {
        if (error.message.includes("Invalid")) {
          errorMessage = "Invalid code. Please try again.";
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
          description: "Please try logging in again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetup2FA = async (code: string) => {
    if (!email || !secretKey) return;
    
    setVerificationError(null);
    setIsLoading(true);
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User not found. Please ensure you're logged in.");
      }
      
      // Call our edge function to validate and enable 2FA
      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: {
          action: 'validate',
          code: code,
          secret: secretKey,
          userId: user.id,
          email: email
        }
      });
      
      if (error || !data?.success) {
        console.error("Error setting up 2FA:", error || data?.error);
        throw new Error(data?.error || "Invalid verification code");
      }
      
      toast({
        title: "Two-factor authentication enabled",
        description: "Your account is now protected with 2FA.",
        variant: "default",
      });
      
      // Update the state to show verification screen
      setIs2FASetup(true);
      setShowSetup(false);
    } catch (error: any) {
      console.error("Setup error:", error);
      setVerificationError(error.message || "Failed to set up 2FA. Please try again.");
      
      toast({
        title: "Setup failed",
        description: error.message || "Failed to set up 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    sessionStorage.removeItem('auth_email');
    navigate('/auth/signin', { replace: true });
  };
  
  const handleStartSetup = () => {
    setShowSetup(true);
  };

  // Render the appropriate screen based on 2FA status
  const renderContent = () => {
    // Still loading or checking status
    if (is2FASetup === null) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-willtank-600"></div>
          <p className="mt-4 text-gray-600">Checking your account security status...</p>
        </div>
      );
    }
    
    // 2FA is set up, show verification screen
    if (is2FASetup) {
      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Authentication Code</Label>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                Open your authenticator app (like Google Authenticator) and enter the 6-digit code shown for your WillTank account.
              </p>
            </div>
            <VerificationCodeInput 
              onSubmit={handleVerifyOTP}
              loading={isLoading}
              autoSubmit={true}
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
              Having trouble?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={handleBackToLogin}
              >
                Go back to login
              </Button>
            </p>
          </div>
        </div>
      );
    }
    
    // 2FA needs to be set up
    if (showSetup) {
      return (
        <div className="space-y-6">
          <Alert className="bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Two-factor authentication required</AlertTitle>
            <AlertDescription className="text-amber-700">
              For your account's security, you must set up two-factor authentication to continue.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">1. Install an authenticator app</h3>
              <p className="text-sm text-gray-600 mb-2">
                Download Google Authenticator or another TOTP app on your phone.
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://apps.apple.com/us/app/google-authenticator/id388497605" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-xs bg-slate-100 py-1 px-3 rounded-full text-slate-700"
                >
                  App Store
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-slate-100 py-1 px-3 rounded-full text-slate-700"
                >
                  Google Play
                </a>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">2. Scan this QR code</h3>
              {qrCodeUrl && (
                <div className="flex justify-center bg-white p-4 border border-slate-100 rounded-md mb-2">
                  <QRCode value={qrCodeUrl} size={200} />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Open your authenticator app and scan this QR code to add WillTank.
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">3. Enter the verification code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code displayed in your authenticator app:
              </p>
              <VerificationCodeInput 
                onSubmit={handleSetup2FA}
                loading={isLoading}
                autoSubmit={true}
                error={verificationError}
              />
              
              {verificationError && (
                <div className="flex items-start text-sm text-red-500 mt-2">
                  <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{verificationError}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="ghost"
              onClick={handleBackToLogin}
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </div>
        </div>
      );
    }
    
    // Prompt user to set up 2FA
    return (
      <div className="space-y-6">
        <Alert className="bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Two-factor authentication required</AlertTitle>
          <AlertDescription className="text-amber-700">
            For your account's security, you must set up two-factor authentication to continue.
          </AlertDescription>
        </Alert>
        
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center text-center">
          <Shield className="h-12 w-12 text-willtank-600 mb-3" />
          <h3 className="font-medium text-lg mb-2">Enhance Your Account Security</h3>
          <p className="text-gray-600 mb-6">
            Two-factor authentication adds an extra layer of security by requiring a verification code in addition to your password.
          </p>
          <Button 
            onClick={handleStartSetup} 
            className="w-full"
            disabled={isLoading}
          >
            Set Up Two-Factor Authentication
          </Button>
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <Button 
            variant="ghost"
            onClick={handleBackToLogin}
            disabled={isLoading}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle={is2FASetup ? "Enter the 6-digit code from your authenticator app to complete the login." : "Secure your account with two-factor authentication."}
      rightPanel={<SecurityInfoPanel />}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {renderContent()}
      </motion.div>
    </AuthLayout>
  );
}
