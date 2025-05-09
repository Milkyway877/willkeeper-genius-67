
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Mail, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Verification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  const [type, setType] = useState<string>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(120);
  const [canResend, setCanResend] = useState<boolean>(false);
  
  // Get email from URL query parameter or session storage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const typeParam = params.get('type') || 'signup';
    
    const storedEmail = emailParam || sessionStorage.getItem('auth_email');
    
    if (!storedEmail) {
      // No email found, redirect to sign in
      navigate('/auth/signin', { replace: true });
      return;
    }
    
    setEmail(storedEmail);
    setType(typeParam);
    
    // Start countdown for resend button
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [location.search, navigate]);
  
  const handleResendVerification = async () => {
    if (!email || isLoading) return;
    
    setIsLoading(true);
    setCanResend(false);
    setRemainingTime(120);
    
    try {
      // Try to send verification email through the edge function
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: {
          email: email,
          type: type,
          useLink: true
        }
      });
      
      if (error || !data?.success) {
        console.error("Error resending verification:", error || data?.error);
        toast({
          title: "Failed to resend verification",
          description: data?.error || "We couldn't resend the verification email. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Verification email sent",
        description: "Please check your email inbox and click the verification link.",
        variant: "default",
      });
      
      // Start countdown again
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error in handleResendVerification:", error);
      toast({
        title: "Failed to resend verification",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReturnToLogin = () => {
    sessionStorage.removeItem('auth_email');
    navigate('/auth/signin');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {email && (
        <>
          <div className="w-full max-w-md mb-6">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>
                We've sent a verification link to <strong>{email}</strong>
              </AlertDescription>
            </Alert>
          </div>
          
          <EmailVerificationBanner />
          
          <div className="mt-8 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-4">
              {canResend ? "Didn't receive the email?" : `Resend available in ${remainingTime} seconds`}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={!canResend || isLoading}
              >
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Resend Verification Email
              </Button>
              
              <Button variant="ghost" onClick={handleReturnToLogin}>
                Return to Login
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
