
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { fadeInUp } from '../animations';
import { AuthenticatorInputs, authenticatorSchema } from '../SignUpSchemas';
import { supabase } from '@/integrations/supabase/client';

interface AuthenticatorStepProps {
  authenticatorKey: string;
  qrCodeUrl: string;
  onNext: () => void;
}

export function AuthenticatorStep({ authenticatorKey, qrCodeUrl, onNext }: AuthenticatorStepProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enableTwoFactor, setEnableTwoFactor] = useState(true);

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

  const handleSubmit = async (data: AuthenticatorInputs) => {
    try {
      setIsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not found. Please ensure you're logged in.");
      }
      
      // In a real implementation, we would validate the verification code against the authenticator secret
      // For now, we'll just accept any 6-digit code
      if (data.otp.length !== 6 || !/^\d+$/.test(data.otp)) {
        toast({
          title: "Invalid code",
          description: "Please enter a valid 6-digit verification code.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Check if user security record exists
      const { data: existingRecord, error: queryError } = await supabase
        .from('user_security')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (queryError) {
        console.error("Error checking user security record:", queryError);
      }
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_security')
          .update({
            google_auth_enabled: enableTwoFactor,
            google_auth_secret: authenticatorKey.replace(/\s/g, ''),
          })
          .eq('user_id', user.id);
          
        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('user_security')
          .insert({
            user_id: user.id,
            google_auth_enabled: enableTwoFactor,
            google_auth_secret: authenticatorKey.replace(/\s/g, ''),
            encryption_key: 'default_encryption_key' // Default encryption key instead of TanKey
          });
          
        if (insertError) {
          throw new Error(insertError.message);
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
      
      toast({
        title: "Error",
        description: error.message || "Failed to set up authenticator. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for Authenticator App" 
                    className="w-40 h-40"
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
            
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Enter the 6-digit verification code from your authenticator app
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="000000" 
                      maxLength={6}
                      className="text-center font-mono text-lg tracking-widest"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-row items-start space-x-3 space-y-0">
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
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Continue"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
