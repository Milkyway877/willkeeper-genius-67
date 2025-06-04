
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { fadeInUp } from '../animations';
import { AuthenticatorInputs, authenticatorSchema } from '../SignUpSchemas';
import { supabase } from '@/integrations/supabase/client';
import { QRCode } from '@/components/ui/QRCode';
import { TwoFactorInput } from '@/components/ui/TwoFactorInput';

interface AuthenticatorStepProps {
  authenticatorKey: string;
  qrCodeUrl: string;
  onNext: () => void;
}

export function AuthenticatorStep({ authenticatorKey, qrCodeUrl, onNext }: AuthenticatorStepProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enableTwoFactor, setEnableTwoFactor] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [localKey, setLocalKey] = useState(authenticatorKey);
  const [localQrCode, setLocalQrCode] = useState(qrCodeUrl);

  const form = useForm<AuthenticatorInputs>({
    resolver: zodResolver(authenticatorSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    if (!authenticatorKey || !qrCodeUrl) {
      console.log("Generating new TOTP secret due to missing key or QR code");
      generateNewSecretIfNeeded();
    } else {
      setLocalKey(authenticatorKey);
      setLocalQrCode(qrCodeUrl);
    }
  }, [authenticatorKey, qrCodeUrl]);

  const generateNewSecretIfNeeded = async () => {
    try {
      setIsLoading(true);
      
      // Call our edge function to generate a new secret
      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: { action: 'generate' }
      });
      
      if (error) {
        console.error("Error calling edge function:", error);
        toast({
          title: "Error",
          description: "Failed to generate 2FA secret. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data && data.success && data.secret && data.qrCodeUrl) {
        console.log("Generated new TOTP secret and QR code from edge function");
        setLocalKey(data.secret);
        setLocalQrCode(data.qrCodeUrl);
      } else {
        console.error("Unexpected response from edge function:", data);
        toast({
          title: "Error",
          description: "Unexpected response when generating 2FA secret.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating TOTP secret:", error);
      toast({
        title: "Error",
        description: "Failed to generate 2FA secret. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const cleanKey = localKey.replace(/\s/g, '');
    navigator.clipboard.writeText(cleanKey);
    setCopied(true);
    toast({
      title: "Key copied",
      description: "Authenticator key has been copied to your clipboard."
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyOTP = async (code: string) => {
    if (!code || code.length !== 6) {
      setVerificationError("Please enter a valid 6-digit code");
      return false;
    }

    try {
      setIsLoading(true);
      setVerificationError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: { 
          action: 'validate', 
          code: code, 
          secret: localKey.replace(/\s/g, ''),
          userId: user.id
        }
      });

      if (error) {
        console.error("Error validating TOTP:", error);
        setVerificationError("Failed to verify code. Please try again.");
        return false;
      }

      if (data && data.success) {
        toast({
          title: "Success!",
          description: "Two-factor authentication has been enabled successfully."
        });
        return true;
      } else {
        setVerificationError("Invalid verification code. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error in OTP verification:", error);
      setVerificationError("An error occurred during verification. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AuthenticatorInputs) => {
    if (!enableTwoFactor) {
      onNext();
      return;
    }

    const isValid = await verifyOTP(data.otp);
    if (isValid) {
      onNext();
    }
  };

  if (isLoading && !localKey) {
    return (
      <motion.div 
        className="w-full max-w-md mx-auto text-center"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-willtank-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Generating authentication setup...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Secure Your Account</h2>
        <p className="text-gray-600 mt-2">
          Set up two-factor authentication for enhanced security
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-2fa"
            checked={enableTwoFactor}
            onCheckedChange={(checked) => setEnableTwoFactor(!!checked)}
          />
          <label htmlFor="enable-2fa" className="text-sm font-medium">
            Enable two-factor authentication (recommended)
          </label>
        </div>

        {enableTwoFactor && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                    <li>Scan the QR code or enter the key manually</li>
                    <li>Enter the 6-digit code from your app</li>
                  </ol>
                </div>
              </div>
            </div>

            {localQrCode && (
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <QRCode 
                    value={localQrCode}
                    size={200}
                    color="#2D8B75"
                    backgroundColor="#ffffff"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Scan this QR code with your authenticator app
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Or enter this key manually:
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-gray-100 rounded border text-sm font-mono break-all">
                  {localKey}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <TwoFactorInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          placeholder="Enter 6-digit code"
                        />
                      </FormControl>
                      <FormMessage />
                      {verificationError && (
                        <p className="text-sm text-red-600">{verificationError}</p>
                      )}
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {!enableTwoFactor && (
          <Button
            onClick={onNext}
            className="w-full"
            variant="outline"
          >
            Skip Two-Factor Authentication
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
