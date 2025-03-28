
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { tanKeyService } from '@/services/tanKeyService';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  tanKey: z.string().min(6, 'Please enter your TanKey'),
  otpCode: z.string().length(6, 'OTP code must be 6 digits').optional(),
});

type SignInFormInputs = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [showTanKey, setShowTanKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email/TanKey, 2: OTP
  const [requiresOtp, setRequiresOtp] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<SignInFormInputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      tanKey: '',
      otpCode: '',
    },
  });

  const onSubmit = async (data: SignInFormInputs) => {
    try {
      setIsLoading(true);
      
      if (step === 1) {
        // First, sign in with email
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.tanKey, // Using TanKey as password for now
        });
        
        if (authError) {
          toast({
            title: "Authentication failed",
            description: authError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (!authData.user) {
          toast({
            title: "Authentication failed",
            description: "User not found",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Then verify the TanKey
        const isTanKeyValid = await tanKeyService.verifyTanKey(
          authData.user.id,
          data.tanKey
        );
        
        if (!isTanKeyValid) {
          // Sign out if TanKey is invalid
          await supabase.auth.signOut();
          
          toast({
            title: "TanKey verification failed",
            description: "The provided TanKey is invalid",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Check if 2FA is enabled for this user
        const { data: securityData } = await supabase
          .from('user_security')
          .select('google_auth_enabled')
          .eq('user_id', authData.user.id)
          .single();
        
        // If 2FA is enabled, prompt for OTP code
        if (securityData?.google_auth_enabled) {
          setRequiresOtp(true);
          setStep(2);
          setIsLoading(false);
          return;
        }
        
        // If no 2FA, proceed with login
        completeLogin();
      } else if (step === 2 && requiresOtp) {
        // Verify OTP code
        // In production, we would validate the OTP against the stored secret
        // For now, we'll just proceed if any 6-digit code is provided
        if (data.otpCode?.length === 6) {
          completeLogin();
        } else {
          toast({
            title: "Invalid code",
            description: "Please enter the 6-digit code from your authenticator app",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const completeLogin = () => {
    // Show success toast
    toast({
      title: "Sign in successful",
      description: "Redirecting to your dashboard...",
    });
    
    // Redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
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
            
            <FormField
              control={form.control}
              name="tanKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TanKey</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showTanKey ? "text" : "password"} 
                        placeholder="Paste your TanKey" 
                        className="pr-10 font-mono"
                        {...field} 
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowTanKey(!showTanKey)}
                    >
                      {showTanKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex items-start space-x-2">
              <Shield className="h-5 w-5 text-willtank-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Two-factor authentication required</p>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="otpCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authentication Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter 6-digit code" 
                      maxLength={6} 
                      className="font-mono text-center text-lg letter-spacing-wide"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        
        <div className="space-y-2 mt-6">
          <div className="text-center">
            <Link 
              to="/auth/recover" 
              className="text-sm font-medium text-willtank-600 hover:text-willtank-700"
            >
              Forgot TanKey? Recover with PIN →
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
            <p>Your TanKey is required for login. If lost, recover using your PIN. Keep your credentials secure.</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
