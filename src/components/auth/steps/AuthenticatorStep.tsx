import React, { useState } from 'react';
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
import { validateTOTP } from '@/services/encryptionService';
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

  const form = useForm<AuthenticatorInputs>({
    resolver: zodResolver(authenticatorSchema),
    defaultValues: {
      otp: '',
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(authenticatorKey.replace(/\s/g, ''));
    setCopied(true);
    toast({
      title: "Key copied",
      description: "Authenticator key has been copied to your clipboard."
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyOTP = async (code: string) => {
    if (!code || code.length !== 6) {
      setVerificationError("Please enter a valid 6-digit code");
      return;
    }
    
    setVerificationError(null);
    setIsLoading(true);
    
    try {
      const cleanCode = code.replace(/\s+/g, '');
      
      if (!authenticatorKey) {
        throw new Error("Missing authenticator key. Please refresh the page and try again.");
      }
      
      console.log("Verifying OTP:", cleanCode);
      console.log("Using authenticator key:", authenticatorKey);
      
      // Validate the OTP code with a larger window to account for time drift
      const isValid = validateTOTP(cleanCode, authenticatorKey);
      console.log("OTP validation result:", isValid);
      
      if (!isValid) {
        setVerificationError("Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }

      // If the code is valid, we'll manually update the database
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User not found. Please ensure you're logged in.");
      }
      
      console.log("Setting up 2FA for user:", user.id);
      
      // Generate a random encryption key if needed
      const encryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Insert directly to user_security table - only include required fields
      const { error: insertError } = await supabase
        .from('user_security')
        .upsert({
          user_id: user.id,
          google_auth_enabled: enableTwoFactor,
          google_auth_secret: authenticatorKey.replace(/\s+/g, ''),
          encryption_key: encryptionKey
        });
        
      if (insertError) {
        console.error("Error updating security record:", insertError);
        throw new Error("Failed to update security settings. Database error.");
      }
      
      toast({
        title: "Two-factor authentication " + (enableTwoFactor ? "enabled" : "configured"),
        description: enableTwoFactor 
          ? "Your account is now protected with 2FA." 
          : "You can enable 2FA later in your security settings.",
      });
      
      // Success! Proceed to next step
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
                    value={qrCodeUrl} 
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
                    {authenticatorKey}
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
                onCheckedChange={(checked) => setEnableTwoFactor(checked === true)}
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
        </form>
      </Form>
    </motion.div>
  );
}
