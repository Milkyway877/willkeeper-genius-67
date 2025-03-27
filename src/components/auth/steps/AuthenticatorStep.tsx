
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AuthenticatorInputs, authenticatorSchema } from '../SignUpSchemas';
import { fadeInUp } from '../animations';
import { toast } from '@/hooks/use-toast';

interface AuthenticatorStepProps {
  authenticatorKey: string;
  qrCodeUrl: string;
  onNext: () => void;
}

export function AuthenticatorStep({ authenticatorKey, qrCodeUrl, onNext }: AuthenticatorStepProps) {
  const [copied, setCopied] = useState(false);
  
  const form = useForm<AuthenticatorInputs>({
    resolver: zodResolver(authenticatorSchema),
    defaultValues: {
      otp: '',
    },
  });

  const copyAuthKey = () => {
    navigator.clipboard.writeText(authenticatorKey);
    setCopied(true);
    toast({
      title: "Key copied",
      description: "Authentication key copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // For demo purposes, we'll accept any 6-digit code
  const handleSubmit = (data: AuthenticatorInputs) => {
    console.log('Authenticator code submitted:', data.otp);
    onNext();
  };

  return (
    <motion.div key="authenticator" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Set Up Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For additional security, we require setting up two-factor authentication using Google Authenticator or a similar app.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">1. Scan QR Code</h4>
              <div className="bg-white p-4 border rounded-md inline-block">
                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">2. Or Enter Key Manually</h4>
              <p className="text-sm text-muted-foreground mb-2">
                If you can't scan the QR code, enter this key in your authenticator app:
              </p>
              <div className="relative bg-slate-50 p-3 rounded-md border border-slate-200 font-mono text-center break-all mb-4">
                {authenticatorKey}
                <button
                  type="button"
                  onClick={copyAuthKey}
                  className="absolute top-2 right-2 p-1 bg-slate-100 rounded hover:bg-slate-200"
                  aria-label="Copy to clipboard"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              
              <h4 className="text-sm font-medium mt-4 mb-2">3. Verify Setup</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Enter the 6-digit code from your authenticator app:
              </p>
              
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <h4 className="text-sm font-medium mb-1">Recommended Authenticator Apps:</h4>
            <ul className="text-sm text-muted-foreground ml-5 list-disc">
              <li>Google Authenticator (iOS/Android)</li>
              <li>Authy (iOS/Android/Desktop)</li>
              <li>Microsoft Authenticator (iOS/Android)</li>
            </ul>
          </div>
          
          <Button type="submit" className="w-full">
            Verify & Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
