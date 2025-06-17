
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const verificationSchema = z.object({
  code: z.string().min(6, 'Verification code must be 6 digits').max(6, 'Verification code must be 6 digits'),
});

type VerificationFormInputs = z.infer<typeof verificationSchema>;

export function EmailVerificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup';

  const form = useForm<VerificationFormInputs>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (!email) {
      toast({
        title: "Missing email address",
        description: "Please return to the signup page to complete registration.",
        variant: "destructive",
      });
      navigate('/auth/signup');
    }
  }, [email, navigate]);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const resendVerificationCode = async () => {
    if (!email) return;
    
    try {
      setIsResending(true);
      
      const verificationCode = generateVerificationCode();
      
      // Send new verification email
      const { data, error } = await supabase.functions.invoke('send-verification', {
        body: {
          email: email,
          code: verificationCode,
          type: type
        }
      });

      if (error) throw error;

      // Store new verification code
      const { error: insertError } = await supabase
        .from('email_verification_codes')
        .insert({
          email: email,
          code: verificationCode,
          type: type,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          used: false
        });

      if (insertError) throw insertError;
      
      toast({
        title: "Verification code sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast({
        title: "Failed to resend code",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: VerificationFormInputs) => {
    if (!email) return;
    
    try {
      setIsLoading(true);
      
      // Verify the code
      const { data: codeData, error: verifyError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('code', data.code)
        .eq('type', type)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verifyError || !codeData) {
        toast({
          title: "Invalid verification code",
          description: "The code you entered is incorrect or has expired. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Mark code as used
      await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', codeData.id);

      // Update user profile to mark email as verified and activate account
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            email_verified: true,
            activation_complete: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }
      }

      toast({
        title: "Email verified successfully!",
        description: "Welcome to WillTank! Your account is now active.",
      });

      // Redirect directly to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast({
        title: "Verification failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-700">Verification Code</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    className="text-center text-2xl tracking-widest font-mono rounded-lg border-2 border-gray-300"
                    maxLength={6}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Verify Email <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code? Check your spam folder.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={resendVerificationCode}
              disabled={isResending}
              className="flex items-center gap-2"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          The verification code expires in 30 minutes. If you need help, please contact support.
        </p>
      </div>
    </div>
  );
}
