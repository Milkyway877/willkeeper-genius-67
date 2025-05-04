
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { OTPInput } from '@/components/ui/OTPInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  sendVerificationCode, 
  verifyCode, 
  getTemporaryCredentials,
  clearTemporaryCredentials 
} from '@/services/authService';

export function EmailVerificationForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const email = searchParams.get('email') || getTemporaryCredentials().email || '';
  const type = (searchParams.get('type') || 'signup') as 'signup' | 'login' | 'recovery';
  const next = searchParams.get('next') || '/dashboard';
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [debug, setDebug] = useState(searchParams.get('debug') === 'true');
  
  // If no email is provided, redirect to sign in
  useEffect(() => {
    if (!email) {
      navigate('/auth/signin', { replace: true });
    }
  }, [email, navigate]);

  // Handle verification submission
  const handleVerify = async (code: string) => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    setAttempts(prev => prev + 1);
    
    try {
      const result = await verifyCode(email, code, type);
      
      if (!result.success) {
        setError(result.message);
        toast({
          title: "Verification failed",
          description: result.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Clear temporary credentials once verification is complete
      clearTemporaryCredentials();
      
      toast({
        title: "Verification successful",
        description: type === 'signup' 
          ? "Your account has been verified. Welcome!" 
          : "Your email has been verified.",
      });
      
      // Redirect to the next page
      navigate(next, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Email verification error:', error);
      setError(message);
      toast({
        title: "Verification error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setError(null);
    
    try {
      const result = await sendVerificationCode(email, type);
      
      if (!result.success) {
        setError(result.message);
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        setResendLoading(false);
        return;
      }
      
      // Reset the code input
      setVerificationCode('');
      setAttempts(0);
      
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email."
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error resending code:', error);
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          {type === 'signup' ? 'Verify your account' : type === 'login' ? 'Verify your login' : 'Verify your email'}
        </h2>
        <p className="text-sm text-muted-foreground">
          We've sent a verification code to <strong>{email}</strong>. Please enter it below.
        </p>
      </div>
      
      <div className="space-y-4">
        <OTPInput
          value={verificationCode}
          onChange={setVerificationCode}
          onComplete={handleVerify}
          disabled={isLoading}
          error={error}
        />
        
        <Button 
          onClick={() => handleVerify(verificationCode)} 
          disabled={verificationCode.length !== 6 || isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>
        
        {attempts > 2 && (
          <Alert>
            <AlertDescription>
              Having trouble? You can request a new code or check your spam folder.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-center">
          <Button 
            variant="link" 
            className="text-xs"
            onClick={handleResendCode}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : "Didn't receive a code? Resend"}
          </Button>
        </div>
      </div>
    </div>
  );
}
