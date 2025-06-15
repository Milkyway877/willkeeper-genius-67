
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import Captcha from '@/components/auth/Captcha';
import { useCaptcha } from '@/hooks/use-captcha';
import { RecoverOtpForm } from './RecoverOtpForm';

const recoverSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type RecoverFormInputs = z.infer<typeof recoverSchema>;

export function RecoverForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [otpStage, setOtpStage] = useState<'request' | 'otp'>('request');
  const [email, setEmail] = useState('');
  const { captchaRef, handleCaptchaValidation } = useCaptcha();

  const form = useForm<RecoverFormInputs>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: RecoverFormInputs) => {
    if (captchaRef.current) {
      const isCaptchaValid = captchaRef.current.validate();
      if (!isCaptchaValid) {
        toast({
          title: "Security check required",
          description: "Please complete the captcha verification first.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      await fetch("/functions/v1/send-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      setEmail(data.email);
      setOtpStage('otp');
      toast({
        title: "Verification code sent",
        description: "If an account exists with this email, you'll receive a verification code to reset your password.",
      });
    } catch (error) {
      toast({
        title: "Verification code sent",
        description: "If an account exists with this email, you'll receive a verification code to reset your password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // OTP stage: show OTP + password entry form instead of this
  if (otpStage === 'otp' && email) {
    return (
      <RecoverOtpForm
        email={email}
        onSuccess={() => {
          setOtpStage('request');
          setEmail('');
        }}
        onBack={() => {
          setOtpStage('request');
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700">Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" className="rounded-lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Captcha
            ref={captchaRef}
            onValidated={handleCaptchaValidation}
          />
        </div>

        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Code...
            </>
          ) : (
            <>
              Send Verification Code <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200 mt-4">
          <p className="font-medium">We'll send you a verification code for resetting your password.</p>
        </div>

        <div className="text-center text-sm">
          <Link
            to="/auth/signin"
            className="font-medium text-willtank-600 hover:text-willtank-700"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
