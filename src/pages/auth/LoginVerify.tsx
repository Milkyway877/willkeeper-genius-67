
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';

export default function LoginVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!token || !email) {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification link. Missing required parameters.');
      setIsLoading(false);
      return;
    }
    
    verifyLoginToken();
  }, [token, email]);

  const verifyLoginToken = async () => {
    try {
      setIsLoading(true);
      
      // Check if the token is valid using the database function
      const { data: isValid, error: functionError } = await supabase.rpc(
        'is_verification_token_valid',
        { check_email: email, check_token: token, check_type: 'login' }
      );
      
      let isTokenValid = false;
      
      if (functionError) {
        console.error("Error checking token validity:", functionError);
        // Proceed with manual check if function fails
        
        // Manual token check
        const { data: tokenData, error: tokenError } = await supabase
          .from('email_verification_codes')
          .select('*')
          .eq('email', email)
          .eq('token', token)
          .eq('type', 'login')
          .eq('used', false)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();
          
        if (tokenError) {
          console.error("Error querying token:", tokenError);
          throw new Error("Failed to verify login. Please try again.");
        }
        
        if (tokenData) {
          isTokenValid = true;
        }
      } else {
        isTokenValid = isValid === true;
      }
      
      if (!isTokenValid) {
        setVerificationStatus('error');
        setErrorMessage('This verification link is invalid or has expired. Please request a new login verification.');
        setIsLoading(false);
        return;
      }
      
      // Mark the token as used
      const { error: updateError } = await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('token', token)
        .eq('email', email);
        
      if (updateError) {
        console.warn("Error marking token as used:", updateError);
        // Continue anyway since we can still verify the login
      }
      
      // Update login timestamp in user profile
      const { error: loginError } = await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email);
        
      if (loginError) {
        console.error("Error updating login timestamp:", loginError);
        // Non-critical error, continue
      }
      
      // Automatically sign in the user
      try {
        // We need to check if Google Authenticator is enabled for this user
        const { data: securityData } = await supabase
          .from('user_security')
          .select('google_auth_enabled')
          .eq('email', email)
          .maybeSingle();
          
        if (securityData?.google_auth_enabled) {
          // If 2FA is enabled, redirect to the 2FA page
          toast({
            title: "Email verified",
            description: "Please enter your Google Authenticator code to complete login.",
          });
          
          // Store email in session storage for 2FA verification
          sessionStorage.setItem('auth_email', email);
          
          // Redirect to 2FA page
          navigate('/auth/two-factor', { replace: true });
          return;
        }
        
        // If 2FA is not enabled, proceed with direct login
        // Success!
        setVerificationStatus('success');
        setIsLoading(false);
        
        toast({
          title: "Login verified",
          description: "Your login has been verified. You will be redirected to the dashboard.",
        });
        
        // Automatically redirect to dashboard after login verification
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } catch (authError: any) {
        console.error("Error during authentication:", authError);
        setVerificationStatus('error');
        setErrorMessage("Your login was verified, but we couldn't sign you in. Please try logging in directly.");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationStatus('error');
      setErrorMessage(error.message || "An error occurred during verification. Please try again.");
      setIsLoading(false);
      
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify your login. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSignIn = () => {
    navigate('/auth/signin', { replace: true });
  };
  
  const handleDashboard = () => {
    navigate('/dashboard', { replace: true });
  };
  
  const handleRetry = () => {
    setVerificationStatus('loading');
    setIsLoading(true);
    verifyLoginToken();
  };

  return (
    <AuthLayout
      title={verificationStatus === 'loading' ? "Verifying Your Login" : 
             verificationStatus === 'success' ? "Login Verified" : "Verification Failed"}
      subtitle={verificationStatus === 'loading' ? "Please wait while we verify your login..." :
               verificationStatus === 'success' ? "Your login has been successfully verified." : 
               errorMessage}
      rightPanel={<VerificationInfoPanel />}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="space-y-6">
          {verificationStatus === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                Please wait while we verify your login...
              </p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-green-700 font-medium text-xl mb-2">
                Login Successful!
              </p>
              <p className="text-center text-muted-foreground mb-6">
                You have been successfully verified. You will be redirected to your dashboard.
              </p>
              
              <Button onClick={handleDashboard}>
                Go to Dashboard
              </Button>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-center text-red-700 font-medium text-xl mb-2">
                Verification Failed
              </p>
              <p className="text-center text-muted-foreground mb-6">
                {errorMessage}
              </p>
              
              <div className="flex space-x-4">
                <Button variant="outline" onClick={handleRetry}>
                  Retry Verification
                </Button>
                <Button onClick={handleSignIn}>
                  Return to Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AuthLayout>
  );
}
