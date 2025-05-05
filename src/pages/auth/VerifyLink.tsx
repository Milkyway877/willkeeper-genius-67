
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyLink() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup';
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token || !email) {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification link. Missing required parameters.');
      return;
    }

    verifyEmailWithToken();
  }, [token, email]);

  const verifyEmailWithToken = async () => {
    try {
      console.log(`Verifying email ${email} with token ${token}`);
      
      // Check if the verification token exists and is valid
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('verification_token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (verificationError) {
        console.error("Database error when fetching verification token:", verificationError);
        setVerificationStatus('error');
        setErrorMessage("We couldn't verify your email due to a system error. Please try again later.");
        return;
      }
      
      if (!verificationData || verificationData.length === 0) {
        console.error("No valid verification token found");
        
        // Check if the token exists but is invalid
        const { data: anyTokens } = await supabase
          .from('email_verification_codes')
          .select('*')
          .eq('email', email)
          .eq('verification_token', token)
          .limit(1);
          
        if (anyTokens && anyTokens.length > 0) {
          if (new Date(anyTokens[0].expires_at) < new Date()) {
            setErrorMessage("This verification link has expired. Please request a new one.");
          } else if (anyTokens[0].used) {
            setErrorMessage("This verification link has already been used.");
          } else {
            setErrorMessage("Invalid verification link. Please request a new one.");
          }
        } else {
          setErrorMessage("Invalid verification link. Please request a new one.");
        }
        
        setVerificationStatus('error');
        return;
      }

      // Mark verification token as used
      const { error: updateError } = await supabase
        .from('email_verification_codes')
        .update({ 
          used: true,
          link_clicked: true
        })
        .eq('verification_token', token);
        
      if (updateError) {
        console.error("Error marking verification token as used:", updateError);
      }

      // Handle signup vs login flow
      if (type === 'signup') {
        // For signup flow - update user profile to mark activation as complete
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ 
            activation_complete: true, 
            email_verified: true, 
            is_activated: true 
          })
          .eq('email', email);
          
        if (profileError) {
          console.error("Error updating user profile:", profileError);
        }
        
        // Get stored credentials from sessionStorage
        const storedEmail = sessionStorage.getItem('auth_email');
        const storedPassword = sessionStorage.getItem('auth_password');
        
        if (storedEmail && storedPassword) {
          // Sign in the user automatically
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (authError) {
            console.error("Auth error during sign-in after verification:", authError);
            setVerificationStatus('error');
            setErrorMessage("Your email was verified, but we couldn't sign you in automatically. Please sign in manually.");
            return;
          }
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
          
          console.log("User signed in successfully after verification:", authData);
        }
        
        setVerificationStatus('success');
      } else if (type === 'login') {
        // For login flow
        const storedEmail = sessionStorage.getItem('auth_email');
        const storedPassword = sessionStorage.getItem('auth_password');
        
        if (storedEmail && storedPassword) {
          // Sign in the user
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (authError) {
            console.error("Auth error during sign-in after verification:", authError);
            setVerificationStatus('error');
            setErrorMessage("Your email was verified, but we couldn't sign you in. Please try signing in manually.");
            return;
          }
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
          
          // Update user profile to mark email as verified if not already
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ email_verified: true, is_activated: true })
            .eq('email', email);
          
          if (profileError) {
            console.error("Error updating user profile:", profileError);
          }
        } else {
          console.error("No stored credentials found");
          setVerificationStatus('error');
          setErrorMessage("Your email was verified, but your login session expired. Please sign in again.");
          return;
        }
        
        setVerificationStatus('success');
      }
    } catch (error: any) {
      console.error('Error during email verification:', error);
      setVerificationStatus('error');
      setErrorMessage(error.message || "An unexpected error occurred. Please try again later.");
    }
  };

  const handleContinue = () => {
    if (verificationStatus === 'success') {
      toast({
        title: type === 'signup' ? "Account activated!" : "Login successful!",
        description: type === 'signup' ? "Welcome to WillTank. Your account has been activated." : "You have been successfully verified and logged in.",
      });
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth/signin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className={`shadow-lg border-2 ${
          verificationStatus === 'success' ? 'border-green-200' : 
          verificationStatus === 'error' ? 'border-red-200' : 'border-blue-200'
        }`}>
          <CardHeader>
            <div className="flex justify-center mb-4">
              {verificationStatus === 'loading' && (
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              )}
              
              {verificationStatus === 'success' && (
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              )}
              
              {verificationStatus === 'error' && (
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-center text-xl">
              {verificationStatus === 'loading' && "Verifying your email..."}
              {verificationStatus === 'success' && (type === 'signup' ? "Account Activated!" : "Login Successful!")}
              {verificationStatus === 'error' && "Verification Failed"}
            </CardTitle>
            
            <CardDescription className="text-center">
              {verificationStatus === 'loading' && "Please wait while we verify your email address"}
              {verificationStatus === 'success' && (type === 'signup' ? 
                "Your account has been successfully verified" : 
                "Your identity has been confirmed")}
              {verificationStatus === 'error' && errorMessage}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {verificationStatus === 'success' && (
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  {type === 'signup' 
                    ? "Thank you for verifying your email. Your WillTank account is now active and ready to use." 
                    : "You have been successfully verified and will now be redirected to your dashboard."
                  }
                </p>
              </div>
            )}
            
            {verificationStatus === 'error' && (
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  If you continue to experience issues, please contact our support team for assistance.
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button 
              onClick={handleContinue}
              disabled={verificationStatus === 'loading'}
              className={verificationStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {verificationStatus === 'loading' && "Verifying..."}
              {verificationStatus === 'success' && "Continue to Dashboard"}
              {verificationStatus === 'error' && "Return to Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
