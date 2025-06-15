
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
import { supabase } from '@/integrations/supabase/client';

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

  // Helper: check if there is a user with this email, and if they have 2FA enabled
  async function getUser2FAStatus(email: string) {
    // Check user profile by email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email.toLowerCase().trim());
    if (!userData?.user) return false;
    const userId = userData.user.id;
    const { data: securityRow } = await supabase
      .from('user_security')
      .select('google_auth_enabled')
      .eq('user_id', userId)
      .maybeSingle();
    return !!securityRow?.google_auth_enabled;
  }

  // Helper: handle password reset (after validating OTP and optional 2FA)
  async function handlePasswordReset(values: RecoverOtpInputs) {
    setIsLoading(true);
    set2FAError(null);

    try {
      // 1. Look up unused, unexpired, and not-used code in email_verification_codes
      const { data: verificationData, error: verificationError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('code', values.otp)
        .eq('type', 'password-reset')
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (verificationError || !verificationData) {
        toast({
          title: 'Invalid or Expired Code',
          description: 'The code is invalid or expired. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // 2. Mark code as used
      await supabase
        .from('email_verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id);

      // 3. Check 2FA
      let userId: string | undefined = undefined;
      const { data: userRes } = await supabase.auth.admin.getUserByEmail(email.toLowerCase().trim());
      if (!userRes?.user) {
        toast({
          title: "No user found",
          description: "There is no account associated with this email.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      userId = userRes.user.id;

      // Only check 2FA if user exists
      const { data: secRow } = await supabase
        .from('user_security')
        .select('google_auth_enabled, google_auth_secret')
        .eq('user_id', userId)
        .maybeSingle();

      if (secRow?.google_auth_enabled) {
        // If user has 2FA and not provided, prompt for 2FA input
        if (!values.twoFACode && !twoFACode) {
          setShow2FA(true);
          setIsLoading(false);
          return;
        }
        // Validate TOTP code using otplib (which matches backend)
        // We'll make a remote call to an existing edge function or use the same validation logic

        // For simplicity, we'll invoke a universal `two-factor-auth` function
        const { data: twoFAData, error: twoFAError } = await supabase.functions.invoke('two-factor-auth', {
          body: {
            user_id: userId,
            code: values.twoFACode || twoFACode,
            email,
          }
        });
        if (twoFAError || !twoFAData?.success) {
          setShow2FA(true);
          set2FAError("2FA code is incorrect; please try again.");
          setIsLoading(false);
          return;
        }
      }

      // 4. Update the password with Supabase admin API
      const { error: pwErr } = await supabase.auth.admin.updateUserById(userId, {
        password: values.newPassword,
      });
      if (pwErr) {
        toast({ title: "Password reset failed", description: "Check your code and try again.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Password updated",
        description: "Your password has been reset. You can now sign in.",
      });
      onSuccess();

    } catch (e) {
      toast({ title: "Reset failed", description: "Server error. Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function handle2FASubmit(code: string) {
    setTwoFACode(code);
    form.setValue('twoFACode', code);
    handlePasswordReset({ ...form.getValues(), twoFACode: code });
  }

  function handleResendCode() {
    // Call same logic as the forgot password page
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    supabase.functions.invoke('send-verification', {
      body: {
        email,
        code: verificationCode,
        type: 'password-reset'
      }
    }).then(() => {
      // Store in email_verification_codes table
      supabase.from('email_verification_codes').insert({
        email: email.toLowerCase().trim(),
        code: verificationCode,
        type: "password-reset",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        used: false,
      });
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
          onSubmit={form.handleSubmit(handlePasswordReset)}
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
