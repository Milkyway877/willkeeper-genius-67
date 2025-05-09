
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';

export default function EmailVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'signup';
  const email = searchParams.get('email');

  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification link. No token provided.');
      setIsLoading(false);
      return;
    }
    
    verifyToken();
  }, [token, type]);

  const verifyToken = async () => {
    try {
      setIsLoading(true);
      
      // First check if the token is valid using the database function
      if (email) {
        const { data: isValid, error: functionError } = await supabase.rpc(
          'is_verification_token_valid',
          { check_email: email, check_token: token, check_type: type }
        );
        
        if (functionError) {
          console.error("Error checking token validity:", functionError);
          // Proceed with manual check if function fails
        } else if (isValid === true) {
          // Token is valid, proceed with verification
          await processVerification(token, email);
          return;
        }
      }
      
      // If we couldn't use the function or if we don't have an email, try to find the token in the database
      const { data: tokenData, error: tokenError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('token', token)
        .eq('type', type)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
        
      if (tokenError) {
        console.error("Error querying token:", tokenError);
        throw new Error("Failed to verify email. Please try again.");
      }
      
      if (!tokenData) {
        setVerificationStatus('error');
        setErrorMessage('This verification link is invalid or has expired. Please request a new verification email.');
        setIsLoading(false);
        return;
      }
      
      // Process the verification
      await processVerification(token, tokenData.email);
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationStatus('error');
      setErrorMessage(error.message || "An error occurred during verification. Please try again.");
      setIsLoading(false);
      
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify your email. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const processVerification = async (token: string, userEmail: string) => {
    try {
      // Mark the token as used
      const { error: updateError } = await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('token', token);
        
      if (updateError) {
        console.warn("Error marking token as used:", updateError);
        // Continue anyway since we can still verify the user
      }
      
      if (type === 'signup') {
        // For signup flow - update user profile to mark email as verified
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            email_verified: true 
          })
          .eq('email', userEmail);
        
        if (profileError) {
          console.error("Error updating user profile:", profileError);
          throw new Error("Your email was verified, but we couldn't update your profile. Please contact support.");
        }
        
        // Success!
        setVerificationStatus('success');
        setIsLoading(false);
        
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. You can now log in to your account.",
        });
      } else if (type === 'login') {
        // For login flow - process the login verification
        const { error: loginError } = await supabase
          .from('user_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('email', userEmail);
          
        if (loginError) {
          console.error("Error updating login timestamp:", loginError);
          // Non-critical error, continue
        }
        
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
      }
    } catch (error: any) {
      console.error("Error processing verification:", error);
      setVerificationStatus('error');
      setErrorMessage(error.message || "An error occurred during verification. Please try again.");
      setIsLoading(false);
      
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify your email. Please try again.",
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
    verifyToken();
  };

  return (
    <AuthLayout
      title={verificationStatus === 'loading' ? "Verifying Your Email" : 
             verificationStatus === 'success' ? "Email Verified" : "Verification Failed"}
      subtitle={verificationStatus === 'loading' ? "Please wait while we verify your email address..." :
               verificationStatus === 'success' ? "Your email has been successfully verified." : 
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
                Please wait while we verify your email address...
              </p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-green-700 font-medium text-xl mb-2">
                Verification Successful!
              </p>
              <p className="text-center text-muted-foreground mb-6">
                {type === 'signup' 
                  ? "Your email has been verified. You can now sign in to your account."
                  : "Your login has been verified. You will be redirected to the dashboard."}
              </p>
              
              <div className="flex space-x-4">
                {type === 'signup' && (
                  <Button onClick={handleSignIn}>
                    Sign In
                  </Button>
                )}
                
                {type === 'login' && (
                  <Button onClick={handleDashboard}>
                    Go to Dashboard
                  </Button>
                )}
              </div>
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
