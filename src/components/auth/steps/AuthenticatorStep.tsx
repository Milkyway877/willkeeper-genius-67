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
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setVerificationError("Please enter a valid 6-digit code");
      return;
    }
    
    setVerificationError(null);
    setIsLoading(true);
    
    try {
      const cleanCode = code.replace(/\s+/g, '');
      console.log("Setting up 2FA with code:", cleanCode, "and secret:", localKey);
      
      if (!localKey) {
        throw new Error("Missing authenticator key. Please refresh the page and try again.");
      }
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User not found. Please ensure you're logged in.");
      }
      
      console.log("Setting up 2FA for user:", user.id);
      
      // Call our edge function to validate the code
      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: {
          action: 'validate',
          code: cleanCode,
          secret: localKey,
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error calling validation edge function:", error);
        throw new Error("Failed to validate code. Server error.");
      }
      
      console.log("Edge function response:", data);
      
      if (!data || data.success === undefined) {
        console.error("Unexpected response from validation:", data);
        throw new Error("Received invalid response from server.");
      }
      
      if (!data.success) {
        setVerificationError("Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }

      // If we're not enabling 2FA but just validating the code
      if (!enableTwoFactor) {
        // Just update the encryption key if needed, but don't enable 2FA
        const encryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        const { data: existingRecord, error: checkError } = await supabase
          .from('user_security')
          .select('id, encryption_key')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!existingRecord) {
          // Only create a record if one doesn't exist
          const { error: insertError } = await supabase
            .from('user_security')
            .insert({
              user_id: user.id,
              google_auth_enabled: false,
              google_auth_secret: localKey.replace(/\s+/g, ''),
              encryption_key: encryptionKey
            });
            
          if (insertError) {
            console.error("Error creating security record:", insertError);
          }
        }
      }
      
      toast({
        title: "Two-factor authentication " + (enableTwoFactor ? "enabled" : "configured"),
        description: enableTwoFactor 
          ? "Your account is now protected with 2FA." 
          : "You can enable 2FA later in your security settings.",
      });
      
      onNext();
    } catch (error) {
      console.error("Error setting up authenticator:", error);
      setVerificationError(
        error instanceof Error 
          ? error.message 
          : "Failed to set up authenticator. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: AuthenticatorInputs) => {
    verifyOTP(data.otp);
  };

  const toggleTwoFactor = (checked: boolean) => {
    console.log("Toggle 2FA:", checked);
    setEnableTwoFactor(checked);
  };

  return (
    <motion.div key="step6" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Set Up Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Enhance your account security by setting up two-factor authentication (2FA).
              </p>
            </div>
            
            <div className="border border-slate-200 rounded-md p-4 space-y-4">
              <p className="text-sm">
                1. Download an authenticator app like Google Authenticator or Authy.
              </p>
              
              <div>
                <p className="text-sm mb-2">
                  2. Scan this QR code with your authenticator app:
                </p>
                <div className="flex justify-center bg-white p-2 border border-slate-200 rounded-md">
                  <QRCode 
                    value={localQrCode} 
                    size={200}
                  />
                </div>
              </div>
              
              <div>
                <p className="text-sm mb-2">
                  3. Or enter this key manually in your app:
                </p>
                <div className="relative">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-center break-all select-all text-sm">
                    {localKey}
                  </div>
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1 bg-slate-100 rounded hover:bg-slate-200"
                    onClick={copyToClipboard}
                    aria-label="Copy to clipboard"
                  >
                    <Copy size={14} className={copied ? "text-green-500" : ""} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="font-medium mb-2 text-sm">Enter the 6-digit verification code from your authenticator app:</p>
              <TwoFactorInput 
                onSubmit={verifyOTP} 
                loading={isLoading}
                error={verificationError}
              />
            </div>
            
            <div className="flex flex-row items-start space-x-3 space-y-0 mt-4">
              <Checkbox 
                id="enableTwoFactor"
                checked={enableTwoFactor} 
                onCheckedChange={toggleTwoFactor}
              />
              <div className="space-y-1 leading-none">
                <label htmlFor="enableTwoFactor" className="text-sm font-normal">
                  Enable two-factor authentication for my account
                </label>
                <p className="text-xs text-muted-foreground">
                  Highly recommended for securing your account and sensitive documents.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Two-factor authentication adds an extra layer of security by requiring a verification code in addition to your password when signing in.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
