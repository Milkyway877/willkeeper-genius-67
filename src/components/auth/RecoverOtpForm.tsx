
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';

const schema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  twoFACode: z.string().optional(),
}).refine(d => d.newPassword === d.confirmPassword, {
  path: ['confirmPassword'],
  message: "Passwords do not match",
});

type RecoverOtpInputs = z.infer<typeof schema>;

interface RecoverOtpFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function RecoverOtpForm({ email, onSuccess, onBack }: RecoverOtpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAError, set2FAError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [twoFACode, setTwoFACode] = useState('');

  const form = useForm<RecoverOtpInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
      twoFACode: '',
    },
  });

  async function handleVerifyOtpAndSetPassword(values: RecoverOtpInputs) {
    setIsLoading(true);
    set2FAError(null);

    // First verify OTP (and get if user has 2FA)
    let userHas2FA = false;
    let verifyRes: any = null;

    try {
      const verifyOtpResp = await fetch('/functions/v1/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: values.otp }),
      });
      verifyRes = await verifyOtpResp.json();
      if (!verifyRes?.success) {
        toast({
          title: 'Invalid or Expired Code',
          description: 'The code is invalid or expired. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      userHas2FA = verifyRes.userHas2FA;

      // If user has 2FA and not yet entered, show 2FA input
      if (userHas2FA && !values.twoFACode) {
        setShow2FA(true);
        setIsLoading(false);
        return;
      }
    } catch {
      toast({ title: "Verification failed", description: "Unable to verify code.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Call complete-password-reset function
    try {
      const resp = await fetch('/functions/v1/complete-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: values.otp,
          newPassword: values.newPassword,
          twoFACode: values.twoFACode || twoFACode || undefined,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        toast({
          title: "Password updated",
          description: "Your password has been reset. You can now sign in.",
        });
        onSuccess();
      } else if (data.reason === '2fa_required' || data.reason === 'invalid_2fa') {
        setShow2FA(true);
        set2FAError(data.reason === '2fa_required'
          ? "2FA code required"
          : "2FA code is incorrect; please try again."
        );
      } else {
        toast({ title: "Password reset failed", description: "Check your code and try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Reset failed", description: "Server error. Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function handle2FASubmit(code: string) {
    setTwoFACode(code);
    form.setValue('twoFACode', code);
    handleVerifyOtpAndSetPassword({ ...form.getValues(), twoFACode: code });
  }

  function handleResendCode() {
    fetch('/functions/v1/send-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(() => {
      toast({ title: "New code sent", description: "Check your inbox for a new code." });
    });
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold">Enter verification code sent to <span className="break-all">{email}</span></h3>
        <button className="text-xs text-willtank-600 hover:underline mt-1" type="button" onClick={handleResendCode}>
          Didn't receive a code? Resend
        </button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleVerifyOtpAndSetPassword)}
          className="space-y-4"
        >
          {/* OTP Input */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input
                    maxLength={6}
                    inputMode="numeric"
                    autoFocus
                    className="rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Input */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="rounded-lg"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="rounded-lg"
                    placeholder="Confirm password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 2FA (show only if required) */}
          {show2FA && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">Two-Factor Code (if enabled)</label>
              <TwoFactorInput
                onSubmit={handle2FASubmit}
                loading={isLoading}
                error={twoFAError}
                showButton={true}
                value={twoFACode}
                onChange={setTwoFACode}
                autoSubmit={false}
              />
            </div>
          )}

          {/* Buttons */}
          {!show2FA && (
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Reset Password <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          )}

          <div className="text-center mt-2">
            <button onClick={onBack} type="button" className="text-sm text-muted-foreground underline">
              Back
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}

