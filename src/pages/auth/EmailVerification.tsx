
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion } from 'framer-motion';
import { verifyCode, sendVerificationEmail } from '@/utils/email';
import { Loader2 } from 'lucide-react';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
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
      console.log("No email found in URL, redirecting to signup");
      navigate('/auth/signup');
      toast({
        title: "Missing email",
        description: "We couldn't find your email. Please try signing up again.",
        variant: "destructive",
      });
    } else {
      console.log("Email found in URL:", email);
    }
  }, [email, navigate, toast]);

  const handleFormSubmit = async (values: { code: string }) => {
    if (!email) {
      console.error("Missing email");
      toast({
        title: "Missing email",
        description: "Please try signing up again.",
        variant: "destructive",
      });
      navigate('/auth/signup');
      return;
    }
    
    if (!values.code || values.code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log(`Verifying code for ${email}: ${values.code}`);
      const { valid, message } = await verifyCode(email, values.code, 'signup');
      
      if (!valid) {
        toast({
          title: "Verification failed",
          description: message || "Invalid or expired code. Please try again.",
          variant: "destructive",
        });
        
        // If too many attempts, suggest getting a new code
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
      
      console.log("Code verified successfully, updating user profile");
      
      // If successful, mark user as verified in user_profiles
      try {
        // Get session to verify user
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          // Continue anyway - this just means the user isn't logged in yet
        }
        
        if (sessionData?.session?.user) {
          console.log("Updating user profile with activated status");
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ activation_complete: true, email_verified: true })
            .eq('id', sessionData.session.user.id);
            
          if (updateError) {
            console.error("Error updating profile:", updateError);
          } else {
            console.log("Profile updated successfully");
          }
        } else {
          console.log("No active session found, continuing without updating profile");
        }
      } catch (profileError) {
        console.error("Error updating profile:", profileError);
        // Continue anyway - this is not critical
      }
      
      // Success flow
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
        variant: "default",
      });
      
      // Check if we have an active session
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session) {
        console.log("User is authenticated, redirecting to dashboard");
        navigate('/dashboard');
      } else {
        // Try to sign in the user with their information stored in localStorage
        try {
          console.log("Attempting to retrieve stored credentials");
          const storedEmail = localStorage.getItem('tempAuthEmail');
          const storedPassword = localStorage.getItem('tempAuthPassword');
          
          if (storedEmail && storedPassword && storedEmail === email) {
            console.log("Found stored credentials, attempting sign in");
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: storedEmail,
              password: storedPassword,
            });
            
            if (!signInError) {
              console.log("Auto sign-in successful, redirecting to dashboard");
              // Clear stored credentials
              localStorage.removeItem('tempAuthEmail');
              localStorage.removeItem('tempAuthPassword');
              navigate('/dashboard');
              return;
            } else {
              console.log("Auto sign-in failed:", signInError);
            }
          }
        } catch (signInError) {
          console.error("Error during auto sign-in attempt:", signInError);
        }
        
        // If auto sign-in failed or no stored credentials, redirect to sign in
        console.log("User not authenticated, redirecting to signin");
        navigate('/auth/signin', { state: { verifiedEmail: email } });
      }
      
    } catch (error: any) {
      console.error("Error during email verification:", error);
      toast({
        title: "Verification error",
        description: error?.message || "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: "Missing email",
        description: "Please try signing up again.",
        variant: "destructive",
      });
      navigate('/auth/signup');
      return;
    }
    
    setResendLoading(true);
    
    try {
      // Reset verification attempts
      setVerificationAttempts(0);
      
      console.log(`Resending verification email to ${email}`);
      // Use our custom verification email sending
      await sendVerificationEmail(email, 'signup');
      
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
        description: error?.message || "Failed to send a new code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a verification code to ${email || 'your email'}. Please enter the code below to verify your account.`}
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
                    <InputOTP
                      maxLength={6}
                      {...field}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((slot, i) => (
                            <InputOTPSlot key={i} {...slot} index={i} />
                          ))}
                        </InputOTPGroup>
                      )}
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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : "Verify Email"}
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
              {resendLoading ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin inline" /> Sending...
                </>
              ) : "Resend Code"}
            </Button>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
