
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Logo } from '@/components/ui/logo/Logo';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion } from 'framer-motion';

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
      navigate('/auth/signup');
    }
  }, [email, navigate]);

  const handleFormSubmit = async (values: { code: string }) => {
    if (!email) return;
    
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      // First verify the code
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', values.code)
        .eq('type', 'signup')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

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
        return;
      }

      // Mark code as used
      await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id);

      // Update user profile
      await supabase
        .from('user_profiles')
        .update({ activation_complete: true })
        .eq('email', email);
      
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
        variant: "default",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during email verification:', error);
      toast({
        title: "Verification error",
        description: "An unexpected error occurred. Please try again later.",
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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
      
      // Reset the form
      form.reset({ code: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send a new code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a verification code to ${email}. Please enter the code below to verify your account.`}
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
