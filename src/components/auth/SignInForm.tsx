
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Captcha from '@/components/auth/Captcha';
import { useCaptcha } from '@/hooks/use-captcha';
import { sendVerificationEmail } from '@/utils/email';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInFormInputs = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { captchaRef, handleCaptchaValidation, validateCaptcha } = useCaptcha();
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session && !error) {
        toast({
          title: "Welcome back!",
          description: "You are now signed in.",
        });
        navigate('/dashboard');
      }
    };
    
    // Check for a verifiedEmail in the location state (coming from verification page)
    const state = location.state as { verifiedEmail?: string } | null;
    if (state?.verifiedEmail) {
      form.setValue('email', state.verifiedEmail);
      toast({
        title: "Email verified!",
        description: "Your email has been verified. Please sign in.",
      });
    }
    
    handleAuthRedirect();
  }, [navigate, location]);
  
  const form = useForm<SignInFormInputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormInputs) => {
    try {
      setIsLoading(true);
      
      // Validate captcha first
      const isCaptchaValid = validateCaptcha();
      if (!isCaptchaValid) {
        toast({
          title: "Security check failed",
          description: "Please complete the captcha verification correctly before signing in.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          toast({
            title: "Email not verified",
            description: "Please check your inbox and click the verification link before signing in.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
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
      
      toast({
        title: "Sign in successful",
        description: "Redirecting to your dashboard...",
      });
      
      // After successful authentication, redirect to dashboard
      navigate('/dashboard');
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

  const handleResendVerification = async () => {
    const email = form.getValues().email;
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to resend verification.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendVerificationEmail(email, 'signup');
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification code.",
      });
      
      // Redirect to verification page
      navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Error resending verification:", error);
      toast({
        title: "Failed to resend verification",
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
              <FormLabel className="font-medium text-gray-700">Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" className="rounded-lg border-2 border-gray-300" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-gray-700">Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    className="pr-10 rounded-lg border-2 border-gray-300"
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <Captcha 
            ref={captchaRef}
            onValidated={handleCaptchaValidation} 
          />
        </div>
        
        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        
        <div className="space-y-4 mt-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between">
            <Link 
              to="/auth/recover" 
              className="text-sm font-medium text-willtank-600 hover:text-willtank-700"
            >
              Forgot password?
            </Link>
            
            <button
              type="button"
              onClick={handleResendVerification}
              className="text-sm font-medium text-willtank-600 hover:text-willtank-700"
              disabled={isLoading}
            >
              Resend verification email
            </button>
          </div>
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="font-medium">Make sure to use the email address you registered with and verify your email before signing in.</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
