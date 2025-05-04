
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
import { OTPInput } from '@/components/ui/OTPInput';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup';
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
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
    
    // Add debug log to check what URL parameters we're getting
    console.log("Email verification page loaded with:", { email, type });
  }, [email, navigate, type]);

  const handleVerifyCode = async (code: string) => {
    if (!email) return;
    
    setIsLoading(true);
    setVerificationError(null);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log("Verifying code:", code, "for email:", email);
      
      // First verify the code - CRITICAL FIX: Don't use single() here which fails with 406 error
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('type', type)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString());

      console.log("Verification query result:", { data: verificationData, error: verificationError });

      // FIXED: Check if we have any rows in the result array instead of using single()
      if (verificationError || !verificationData || verificationData.length === 0) {
        const errorMessage = "The code you entered is invalid or has expired. Please try again or request a new code.";
        setVerificationError(errorMessage);
        toast({
          title: "Verification failed",
          description: errorMessage,
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

      // Get the first verification record
      const verificationRecord = verificationData[0];

      // Mark code as used
      await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', verificationRecord.id);

      // Get stored credentials
      const storedEmail = sessionStorage.getItem('auth_email') || email;
      const storedPassword = sessionStorage.getItem('auth_password');

      if (type === 'signup') {
        console.log("Processing signup verification flow");
        
        // For signup flow - update user profile to mark activation as complete
        await supabase
          .from('user_profiles')
          .update({ activation_complete: true, email_verified: true, is_activated: true })
          .eq('email', email);
        
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. Welcome to WillTank!",
          variant: "default",
        });
        
        // Critical fix: Set the session_just_verified flag to bypass additional verification
        localStorage.setItem('session_just_verified', 'true');
        console.log("Set session_just_verified flag for signup flow");
        
        // If credentials are stored, sign in the user
        if (storedEmail && storedPassword) {
          console.log("Attempting to sign in after verification with stored credentials");
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
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
          
          console.log("Sign in successful after verification:", signInData);
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
          
          // Check if 2FA is enabled for this user
          const { data: securityData } = await supabase
            .from('user_security')
            .select('google_auth_enabled')
            .eq('user_id', signInData.user.id)
            .single();
          
          if (securityData?.google_auth_enabled) {
            // Redirect to 2FA page if enabled
            navigate(`/auth/two-factor?email=${encodeURIComponent(email)}`, { replace: true });
            return;
          }
          
          // Direct to dashboard if 2FA not enabled
          navigate('/dashboard', { replace: true });
        } else {
          // If no stored credentials but verification successful, still go to dashboard
          // The Layout component will handle authentication check
          navigate('/dashboard', { replace: true });
        }
      } else {
        // For login flow
        console.log("Processing login verification flow");
        
        // Critical fix: Set the session_just_verified flag to bypass additional verification
        localStorage.setItem('session_just_verified', 'true');
        console.log("Set session_just_verified flag for login flow");
        
        if (storedEmail && storedPassword) {
          console.log("Attempting to sign in with stored credentials:", { email: storedEmail });
          
          // Sign in the user
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          
          if (authError) {
            console.error("Sign in error:", authError);
            toast({
              title: "Sign in failed",
              description: authError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            navigate('/auth/signin', { replace: true });
            return;
          }
          
          console.log("Sign in successful:", { user: authData?.user?.id });
          
          // Clear stored credentials
          sessionStorage.removeItem('auth_email');
          sessionStorage.removeItem('auth_password');
          
          // Check if 2FA is enabled for this user
          const { data: securityData } = await supabase
            .from('user_security')
            .select('google_auth_enabled')
            .eq('user_id', authData.user.id)
            .single();
          
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
          
          if (securityData?.google_auth_enabled) {
            // Redirect to 2FA page if enabled
            navigate(`/auth/two-factor?email=${encodeURIComponent(email)}`, { replace: true });
            return;
          }
          
          toast({
            title: "Login successful",
            description: "You have been successfully verified and logged in.",
            variant: "default",
          });
          
          // Navigate to dashboard with replace to prevent back navigation to login
          navigate('/dashboard', { replace: true });
        } else {
          console.error("Missing stored credentials for login verification");
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
      const errorMessage = error.message || "An unexpected error occurred. Please try again later.";
      setVerificationError(errorMessage);
      toast({
        title: "Verification error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setVerificationError(null);
    
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
      setVerificationAttempts(0);
    } catch (error: any) {
      console.error("Error resending code:", error);
      const errorMessage = error.message || "Failed to send a new code. Please try again later.";
      setVerificationError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
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
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <div>
                      <OTPInput 
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
