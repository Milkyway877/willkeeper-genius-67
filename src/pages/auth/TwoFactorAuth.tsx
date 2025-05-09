
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Shield } from 'lucide-react';
import { VerificationCodeInput } from '@/components/ui/VerificationCodeInput';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('auth_email');
    if (!storedEmail) {
      navigate('/auth/signin', { replace: true });
      return;
    }
    
    setEmail(storedEmail);
  }, [navigate]);

  const handleVerifyOTP = async (code: string) => {
    if (!email) return;
    
    // Reset error state
    setVerificationError(null);
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log(`Verifying Google Auth code for email: ${email}`);
      
      // Call our edge function or API to verify the OTP
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
  
  const handleBackToLogin = () => {
    sessionStorage.removeItem('auth_email');
    navigate('/auth/signin', { replace: true });
  };

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle="Enter the 6-digit code from your authenticator app to complete the login."
      rightPanel={<SecurityInfoPanel />}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
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
      </motion.div>
    </AuthLayout>
  );
}
