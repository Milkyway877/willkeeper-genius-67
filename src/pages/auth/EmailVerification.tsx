
import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion } from 'framer-motion';
import { verifyCode, sendVerificationEmail } from '@/utils/email';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
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
      // If there's no email in the URL, redirect to signup
      navigate('/auth/signup');
    }
  }, [email, navigate]);

  // If no email provided, show redirect instead of white screen
  if (!email) {
    return <Navigate to="/auth/signup" replace />;
  }

  const handleFormSubmit = async (values: { code: string }) => {
    if (!email || !values.code) return;
    
    setIsLoading(true);
    setVerificationAttempts(prev => prev + 1);
    setVerificationError(null);
    
    try {
      console.log(`Attempting to verify code for ${email}: ${values.code}`);
      const { valid, message, error } = await verifyCode(email, values.code, 'signup');
      
      if (!valid) {
        setVerificationError(message || "Invalid or expired code. Please try again.");
        
        // If too many attempts, suggest getting a new code
        if (verificationAttempts >= 2) {
          toast({
            title: "Too many attempts",
            description: "Please request a new verification code.",
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      // If code is valid, proceed with account activation
      try {
        // Use a simpler query to find the user by email
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        
        if (error || !data) {
          console.error("Error finding user:", error || "No user found");
          throw new Error("Failed to find user account");
        }
        
        const userId = data.id;
        
        // Mark user as verified in the profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ activation_complete: true })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating user profile:", updateError);
        }
        
        // Try to sign in the user after verification
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. You can now sign in.",
        });
        
        navigate('/auth/signin', { state: { verifiedEmail: email } });
      } catch (error) {
        console.error("Error during account activation:", error);
        toast({
          title: "Verification successful",
          description: "However, we encountered an issue activating your account. Please try signing in.",
        });
        
        navigate('/auth/signin', { state: { verifiedEmail: email } });
      }
    } catch (error) {
      console.error("Error during email verification:", error);
      setVerificationError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setVerificationError(null);
    
    try {
      console.log("Attempting to resend verification code to:", email);
      // Use our custom verification email sending
      const { success, error } = await sendVerificationEmail(email, 'signup');
      
      if (!success) {
        console.error("Failed to resend verification code:", error);
        setVerificationError(error?.message || "Failed to send verification code. Please try again later.");
        setResendLoading(false);
        return;
      }
      
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
      
      // Reset the form
      form.reset({ code: '' });
      // Reset verification attempts
      setVerificationAttempts(0);
    } catch (error) {
      console.error("Failed to resend verification code:", error);
      setVerificationError("Failed to send a new code. Please try again later.");
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
        {verificationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{verificationError}</AlertDescription>
          </Alert>
        )}

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
