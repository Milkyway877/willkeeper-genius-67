import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { TwoFactorInput } from "@/components/ui/TwoFactorInput";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateTOTP, validateRecoveryCode } from "@/services/encryptionService";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function SecurePasswordReset() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);

  // Step 1: Enter Email
  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    try {
      // Try to get 2FA info by email
      const { data, error } = await supabase
        .from("user_security")
        .select("user_id, google_auth_enabled, google_auth_secret")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (error || !data || !data.user_id) {
        toast({
          title: "User not found",
          description: "No account exists with that email.",
          variant: "destructive",
        });
        setChecking(false);
        return;
      }
      if (!data.google_auth_enabled) {
        toast({
          title: "2FA Not Enabled",
          description: "You must enable two-factor authentication to use this password reset flow.",
          variant: "destructive",
        });
        setChecking(false);
        return;
      }
      setUserId(data.user_id);
      setTwoFASecret(data.google_auth_secret || null);
      setStep(2);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not find user.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  // Step 2: Verify TOTP
  const handleTOTPSubmit = async (code: string) => {
    if (!twoFASecret || !userId) {
      toast({
        title: "Internal Error",
        description: "Cannot validate without user info.",
        variant: "destructive",
      });
      return;
    }
    const valid = await validateTOTP(code, twoFASecret);
    if (valid) {
      setStep(3);
    } else {
      toast({
        title: "Invalid code",
        description: "The 2FA code you entered is invalid.",
        variant: "destructive"
      });
    }
  };

  // Step 3: Set new password + recovery code
  const pwForm = useForm<{ password: string; confirm: string; recovery: string }>({
    defaultValues: { password: "", confirm: "", recovery: "" }
  });
  const [saving, setSaving] = useState(false);

  const handlePasswordReset = async (data: { password: string; confirm: string; recovery: string }) => {
    if (!userId || !email) return;
    // Validate password match & length
    if (data.password !== data.confirm) {
      pwForm.setError("confirm", { type: "manual", message: "Passwords do not match" });
      return;
    }
    if (data.password.length < 8) {
      pwForm.setError("password", { type: "manual", message: "Password must be at least 8 characters." });
      return;
    }
    setSaving(true);

    // Validate recovery code (one of user's backup codes)
    const recoveryOk = await validateRecoveryCode(userId, data.recovery.trim());
    if (!recoveryOk) {
      pwForm.setError("recovery", { type: "manual", message: "Invalid or used recovery code." });
      setSaving(false);
      return;
    }

    // Update the password via supabase auth
    const { error } = await supabase.auth.updateUser({
      email,
      password: data.password,
    });

    if (error) {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive"
      });
      setSaving(false);
      return;
    }

    toast({
      title: "Password Reset!",
      description: "Your password has been successfully reset. Please log in.",
    });

    setTimeout(() => {
      navigate("/auth/signin");
    }, 1800);
    setSaving(false);
  };

  return (
    <div className="max-w-md mx-auto pt-12">
      <h2 className="text-2xl font-bold mb-2 text-center">Secure Password Reset</h2>
      {step === 1 && (
        <form onSubmit={handleCheckUser} className="space-y-6">
          <div>
            <Label>Email Address</Label>
            <Input
              required
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={!email || checking}>
            {checking ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Next"}
          </Button>
          <div className="text-sm text-muted-foreground mt-2">
            Enter your account email to start secure password reset. <br /> This method requires you to have two-factor authentication enabled.
          </div>
        </form>
      )}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <FormLabel>Enter your code from Authenticator app</FormLabel>
            <TwoFactorInput
              onSubmit={handleTOTPSubmit}
              showButton={true}
              autoSubmit={false}
            />
          </div>
        </div>
      )}
      {step === 3 && (
        <Form {...pwForm}>
          <form
            className="space-y-6"
            onSubmit={pwForm.handleSubmit(handlePasswordReset)}
            autoComplete="off"
          >
            <FormField
              control={pwForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={pwForm.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={pwForm.control}
              name="recovery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One of your 2FA Recovery Codes</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g., 1A2B-3C4D-..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Reset Password"}
            </Button>
            <div className="text-xs text-muted-foreground text-center mt-1">
              Lost your recovery codes? Contact support for manual account recovery.
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
