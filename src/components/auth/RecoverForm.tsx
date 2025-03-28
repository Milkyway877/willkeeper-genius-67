
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const recoverSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  pin: z.string().length(6, 'PIN must be exactly 6 digits'),
});

type RecoverFormInputs = z.infer<typeof recoverSchema>;

export function RecoverForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<RecoverFormInputs>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: '',
      pin: '',
    },
  });

  const onSubmit = async (data: RecoverFormInputs) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would verify the PIN and generate a new TanKey
      // For now, we'll simulate a successful recovery
      
      // Generate a new TanKey
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      let newTanKey = '';
      for (let i = 0; i < 24; i++) {
        newTanKey += characters.charAt(Math.floor(Math.random() * characters.length));
        if (i % 6 === 5 && i < 23) newTanKey += '-';
      }
      
      // In a real implementation, this would be sent securely to the user's email
      // For now, we'll show it in a toast
      toast({
        title: "New TanKey Generated",
        description: `Your new TanKey is: ${newTanKey}`,
        duration: 10000, // Show for 10 seconds
      });
      
      toast({
        title: "Recovery successful",
        description: "Your new TanKey has been generated. Make sure to store it securely.",
      });
      
      // Wait a bit before redirecting
      setTimeout(() => {
        navigate('/auth/signin');
      }, 10000);
    } catch (error) {
      console.error("Recovery error:", error);
      
      toast({
        title: "Recovery failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Recovering..." : "Recover TanKey"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>
    </Form>
  );
}
