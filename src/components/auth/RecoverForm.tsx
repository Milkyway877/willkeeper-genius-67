
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

// Recovery schema
const recoverSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type RecoverFormInputs = z.infer<typeof recoverSchema>;

export function RecoverForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<RecoverFormInputs>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleResetPassword = async (data: RecoverFormInputs) => {
    try {
      setIsLoading(true);
      
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setEmailSent(true);
      
      toast({
        title: "Recovery email sent",
        description: "Check your inbox for a password reset link",
        duration: 5000,
      });
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
      <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-6">
        {!emailSent ? (
          <>
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
            
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                We'll send you a password reset link to the email address associated with your account.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="text-lg font-medium text-green-800 mb-2">Recovery Email Sent</h3>
              <p className="text-sm text-green-700">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
            
            <Button 
              type="button" 
              onClick={() => navigate('/auth/signin')} 
              className="w-full"
            >
              Return to Sign In
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
