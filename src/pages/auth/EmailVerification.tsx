
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup';
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
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

  const handleFormSubmit = async (values: { code: string }) => {
    if (!email) return;
    
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log("Verifying code:", values.code, "for email:", email);
      
      // First verify the code
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', values.code)
        .eq('type', type)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      console.log("Verification query result:", { data: verificationData, error: verificationError });

      if (verificationError || !verificationData) {
        toast({
          title: "Verification failed",
          description: "The code you entered is invalid or has expired. Please try again or request a new code.",
          variant: "destructive",
        });
        
        if (verificationAttempts >= 3) {
          toast({
            title: "Too many attempts",
            description: "Please request a new verification code.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      // Mark code as used
      await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id);

      if (type === 'signup') {
        // For signup flow - update user profile to mark activation as complete
        await supabase
          .from('user_profiles')
          .update({ activation_complete: true, email_verified: true })
          .eq('email', email);
        
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. Welcome to WillTank!",
          variant: "default",
        });
        
        // Get stored credentials if they exist
        const storedEmail = sessionStorage.getItem('auth_email');
        const storedPassword = sessionStorage.getItem('auth_password');
        
        // If credentials are stored, sign in the user
        if (storedEmail && storedPassword) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (signInError) {
            console.error("Error signing in after verification:", signInError);
            toast({
              title: "Sign in failed",
              description: "Please sign in with your credentials.",
              variant: "destructive",
            });
            navigate('/auth/signin', { replace: true });
            return;
          }
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
        }
        
        // Direct to dashboard after successful signup verification
        navigate('/dashboard', { replace: true });
      } else {
        // For login flow
        // Get credentials from session storage
        const storedEmail = sessionStorage.getItem('auth_email');
        const storedPassword = sessionStorage.getItem('auth_password');
        
        if (storedEmail && storedPassword) {
          // Sign in the user
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (authError) {
            toast({
              title: "Sign in failed",
              description: authError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            navigate('/auth/signin', { replace: true });
            return;
          }
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
          
          // Record verification in the user_security table
          try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              // Update or insert security record
              const userAgent = navigator.userAgent;
              const deviceInfo = JSON.stringify({
                browser: /chrome|firefox|safari|edge|opera/i.exec(userAgent.toLowerCase())?.[0] || 'browser',
                os: /windows|mac|linux|android|ios/i.exec(userAgent.toLowerCase())?.[0] || 'unknown',
                timestamp: new Date().toISOString()
              });
              
              // Check if security record exists
              const { data: securityRecord } = await supabase
                .from('user_security')
                .select('id, known_devices')
                .eq('user_id', user.id)
                .single();
              
              if (securityRecord) {
                // Update existing record
                let knownDevices = securityRecord.known_devices || [];
                if (Array.isArray(knownDevices)) {
                  knownDevices = [...knownDevices, deviceInfo].slice(-5); // Keep last 5 devices
                } else {
                  knownDevices = [deviceInfo];
                }
                
                await supabase
                  .from('user_security')
                  .update({
                    last_verified: new Date().toISOString(),
                    known_devices: knownDevices,
                    failed_login_attempts: 0
                  })
                  .eq('user_id', user.id);
              } else {
                // Create new security record
                await supabase
                  .from('user_security')
                  .insert({
                    user_id: user.id,
                    last_verified: new Date().toISOString(),
                    known_devices: [deviceInfo],
                    failed_login_attempts: 0
                  });
              }
            }
          } catch (securityError) {
            console.error("Error updating security record:", securityError);
            // Non-fatal error, continue with login
          }
          
          toast({
            title: "Login successful",
            description: "You have been successfully verified and logged in.",
            variant: "default",
          });
          
          // Navigate to dashboard with replace to prevent back navigation to login
          navigate('/dashboard', { replace: true });
        } else {
          toast({
            title: "Authentication error",
            description: "Login session expired. Please log in again.",
            variant: "destructive",
          });
          navigate('/auth/signin', { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Error during email verification:', error);
      toast({
        title: "Verification error",
        description: error.message || "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setResendLoading(true);
    
    try {
      // Generate a new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log("Resending verification code to:", email);
      
      // Send verification email
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification', {
        body: {
          email: email,
          code: verificationCode,
          type: type
        }
      });
      
      console.log("Email function response:", { data: emailData, error: emailError });
      
      if (emailError) {
        console.error("Error invoking send-verification function:", emailError);
        throw new Error("Failed to send verification code");
      }
      
      // Store verification code
      const { error: storeError } = await supabase
        .from('email_verification_codes')
        .insert({
          email: email,
          code: verificationCode,
          type: type,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiry
          used: false
        });
      
      if (storeError) {
        console.error("Error storing verification code:", storeError);
        throw new Error("Failed to process verification");
      }
      
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
      
      // Reset the form
      form.reset({ code: '' });
    } catch (error: any) {
      console.error("Error resending code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send a new code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a verification code to ${email}. Please enter the code below to ${type === 'signup' ? 'complete your registration' : 'login'}.`}
      rightPanel={<VerificationInfoPanel />}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <TwoFactorInput 
                      onSubmit={(code) => {
                        field.onChange(code);
                        form.handleSubmit(handleFormSubmit)();
                      }}
                      loading={isLoading}
                      autoSubmit={false}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || form.watch('code').length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Didn't receive a code?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              onClick={handleResendCode}
              disabled={resendLoading}
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </Button>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
