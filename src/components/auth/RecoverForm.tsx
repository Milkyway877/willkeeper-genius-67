
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

const recoverSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  pin: z.string().length(6, 'PIN must be exactly 6 digits'),
});

type RecoverFormInputs = z.infer<typeof recoverSchema>;

export function RecoverForm() {
  const navigate = useNavigate();
  
  const form = useForm<RecoverFormInputs>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: '',
      pin: '',
    },
  });

  const onSubmit = (data: RecoverFormInputs) => {
    console.log('Recovery data submitted:', data);
    
    // Show success toast
    toast({
      title: "Recovery successful",
      description: "Your new TanKey has been sent to your email.",
    });
    
    // Redirect to signin
    setTimeout(() => {
      navigate('/auth/signin');
    }, 1500);
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
        
        <Button type="submit" className="w-full">
          Recover TanKey <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
