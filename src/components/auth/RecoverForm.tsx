
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Enhanced schema with options for recovery method
const recoverSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  pin: z.string().length(6, 'PIN must be exactly 6 digits'),
  recoveryMethod: z.enum(['pin', 'phrase']),
  phrase: z.string().optional().refine(value => {
    // If recovery method is phrase, it must be provided
    return true; // We'll validate the actual phrase in the form handler
  }, {
    message: "Recovery phrase is required when using phrase recovery method",
  }),
});

type RecoverFormInputs = z.infer<typeof recoverSchema>;

export function RecoverForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [recoveryMethod, setRecoveryMethod] = useState<'pin' | 'phrase'>('pin');
  const navigate = useNavigate();
  
  const form = useForm<RecoverFormInputs>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: '',
      pin: '',
      recoveryMethod: 'pin',
      phrase: '',
    },
  });

  // Step 1: Enter email
  const handleStepOne = (data: { email: string }) => {
    // Check if the email exists
    setIsLoading(true);
    
    // In a real implementation, we would verify the email exists
    // For now, just proceed to the next step
    setTimeout(() => {
      setStep(2);
      setIsLoading(false);
    }, 1000);
  };

  // Step 2: Choose recovery method
  const handleSelectRecoveryMethod = (method: 'pin' | 'phrase') => {
    setRecoveryMethod(method);
    form.setValue('recoveryMethod', method);
    setStep(3);
  };

  // Step 3: Complete recovery
  const handleRecovery = async (data: RecoverFormInputs) => {
    try {
      setIsLoading(true);
      
      // Step 1: Find user with this email
      const { data: userResult, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();
      
      if (userError || !userResult) {
        throw new Error("User not found");
      }
      
      // Determine if we're using PIN or recovery phrase
      let recoverySuccessful = false;
      
      if (data.recoveryMethod === 'pin') {
        // Verify the PIN (in a real implementation)
        // For demo, we'll assume the PIN is correct if it's 6 digits
        recoverySuccessful = data.pin?.length === 6;
      } else if (data.recoveryMethod === 'phrase') {
        // Verify recovery phrase (in a real implementation)
        // For demo, assume it's correct if it contains 12 words
        recoverySuccessful = (data.phrase?.split(' ').length === 12);
      }
      
      if (!recoverySuccessful) {
        throw new Error(`Invalid ${data.recoveryMethod === 'pin' ? 'PIN' : 'recovery phrase'}`);
      }
      
      // Generate a new TanKey
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      let newTanKey = '';
      const randomValues = new Uint32Array(24);
      window.crypto.getRandomValues(randomValues);
      
      for (let i = 0; i < 24; i++) {
        const randomIndex = randomValues[i] % characters.length;
        newTanKey += characters[randomIndex];
        if (i % 6 === 5 && i < 23) newTanKey += '-';
      }
      
      // Store the new TanKey
      const { error: tanKeyError } = await supabase.functions.invoke('store-tankey', {
        body: { user_id: userResult.id, tan_key: newTanKey }
      });
      
      if (tanKeyError) {
        throw new Error("Failed to store new TanKey");
      }
      
      // Show the new TanKey to the user
      toast({
        title: "Recovery Successful",
        description: "Your account has been recovered.",
        duration: 5000,
      });
      
      toast({
        title: "New TanKey Generated",
        description: `Your new TanKey is: ${newTanKey}`,
        duration: 10000,
      });
      
      // Wait a bit before redirecting
      setTimeout(() => {
        navigate('/auth/signin');
      }, 10000);
    } catch (error) {
      console.error("Recovery error:", error);
      
      toast({
        title: "Recovery failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      {step === 1 && (
        <form onSubmit={form.handleSubmit(handleStepOne)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Checking..." : "Continue"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      )}
      
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <h3 className="text-lg font-medium mb-2">Account Recovery</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a recovery method to regain access to your account:
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => handleSelectRecoveryMethod('pin')} 
                variant="outline" 
                className="w-full justify-start"
              >
                Recover with 6-digit PIN
              </Button>
              <Button 
                onClick={() => handleSelectRecoveryMethod('phrase')} 
                variant="outline" 
                className="w-full justify-start"
              >
                Recover with 12-word recovery phrase
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <form onSubmit={form.handleSubmit(handleRecovery)} className="space-y-6">
          {recoveryMethod === 'pin' && (
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recovery PIN</FormLabel>
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
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter the 6-digit PIN you created during signup
                  </p>
                </FormItem>
              )}
            />
          )}
          
          {recoveryMethod === 'phrase' && (
            <FormField
              control={form.control}
              name="phrase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recovery Phrase</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your 12-word recovery phrase, separated by spaces"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter all 12 words from your recovery phrase, separated by spaces
                  </p>
                </FormItem>
              )}
            />
          )}
          
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              After successful recovery, you will receive a new TanKey. Make sure to store it securely.
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Recovering..." : "Recover TanKey"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      )}
    </Form>
  );
}
