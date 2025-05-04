
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';
import { OTPInput } from '@/components/ui/OTPInput';
import { 
  verify2FACode,
  getTemporaryCredentials,
  clearTemporaryCredentials 
} from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

export function TwoFactorAuthForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const email = searchParams.get('email') || getTemporaryCredentials().email || '';
  const next = searchParams.get('next') || '/dashboard';
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // If no email is provided, redirect to sign in
  useEffect(() => {
    if (!email) {
      navigate('/auth/signin', { replace: true });
      return;
    }
    
    // Get the current user
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      } else {
        navigate('/auth/signin', { replace: true });
      }
    };
    
    fetchUser();
  }, [email, navigate]);

  // Handle verification submission
  const handleVerify = async (code: string) => {
    if (!email || !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await verify2FACode(code, userId, email);
      
      if (!result.success) {
        setError(result.message);
        toast({
          title: "Authentication failed",
          description: result.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Clear temporary credentials
      clearTemporaryCredentials();
      
      toast({
        title: "Authentication successful",
        description: "You have been successfully verified.",
      });
      
      // Redirect to the next page
      navigate(next, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Two-factor authentication error:', error);
      setError(message);
      toast({
        title: "Authentication error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-muted-foreground">
          Please enter the 6-digit code from your authenticator app.
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
        
        <div className="flex items-center justify-center mt-4 text-center">
          <Shield className="h-4 w-4 text-gray-500 mr-2" />
          <p className="text-sm text-gray-500">
            Protecting your account with two-factor authentication
          </p>
        </div>
      </div>
    </div>
  );
}
