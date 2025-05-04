
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';
import { Shield } from 'lucide-react';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function TwoFactorAuthentication() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (!email) {
      navigate('/auth/signin', { replace: true });
    }
  }, [email, navigate]);

  const handleVerifyCode = async (code: string) => {
    if (!email) return;
    
    setIsLoading(true);
    setVerificationError(null);
    
    try {
      console.log("Verifying 2FA code for email:", email);
      
      // Get user from session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Authentication session expired. Please sign in again.");
      }
      
      // Get user's 2FA secret
      const { data: securityData, error: securityError } = await supabase
        .from('user_security')
        .select('google_auth_secret, google_auth_enabled')
        .eq('user_id', user.id)
        .single();
      
      if (securityError || !securityData?.google_auth_secret || !securityData?.google_auth_enabled) {
        console.error("Error fetching 2FA settings:", securityError);
        throw new Error("Two-factor authentication is not properly set up for this account.");
      }
      
      // Validate 2FA code
      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: { 
          action: 'validate',
          code: code,
          secret: securityData.google_auth_secret
        }
      });
      
      if (error) {
        console.error("Error validating 2FA code:", error);
        throw new Error("Failed to validate authentication code.");
      }
      
      if (!data?.success) {
        setVerificationError("Invalid authentication code. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Mark session as verified
      localStorage.setItem('session_just_verified', 'true');
      
      toast({
        title: "Authentication successful",
        description: "You have been successfully verified.",
        variant: "default",
      });
      
      // Store verification in user security
      try {
        await supabase
          .from('user_security')
          .update({
            last_verified: new Date().toISOString(),
            failed_login_attempts: 0
          })
          .eq('user_id', user.id);
      } catch (securityError) {
        console.error("Error updating security record:", securityError);
        // Non-fatal error, continue with login
      }
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('Error during two-factor authentication:', error);
      const errorMessage = error.message || "An unexpected error occurred. Please try again later.";
      setVerificationError(errorMessage);
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle={`Please enter the 6-digit code from your authenticator app to complete sign-in.`}
      rightPanel={<SecurityInfoPanel mode="verification" />}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Authentication Code</FormLabel>
                  <FormControl>
                    <div>
                      <TwoFactorInput 
                        onSubmit={(code) => {
                          field.onChange(code);
                          handleVerifyCode(code);
                        }}
                        loading={isLoading}
                        autoSubmit={true}
                        error={verificationError}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>

        <div className="flex items-center justify-center mt-6 text-center">
          <Shield className="h-4 w-4 text-gray-500 mr-2" />
          <p className="text-sm text-gray-500">
            Protecting your account with two-factor authentication
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
