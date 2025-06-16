import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Loader2, LifeBuoy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { check2FAStatus } from '@/services/encryptionService';
import { Captcha } from '@/components/auth/Captcha';
import { useCaptcha } from '@/hooks/use-captcha';
import { ClerkSocialLogin } from '@/components/auth/ClerkSocialLogin';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

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
  const { handleCaptchaValidation, validateCaptcha } = useCaptcha();
  
  // Check if Clerk is available before using hooks
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const clerkAuth = CLERK_PUBLISHABLE_KEY ? useClerkAuth() : { isSignedIn: false };
  const { isSignedIn } = clerkAuth;
  
  // Redirect if already signed in via Clerk
  useEffect(() => {
    if (CLERK_PUBLISHABLE_KEY && isSignedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [CLERK_PUBLISHABLE_KEY, isSignedIn, navigate]);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const searchParams = new URLSearchParams(location.search);
      const verified = searchParams.get('verified');
      const { data, error } = await supabase.auth.getSession();
      if (data?.session && !error) {
        if (verified === 'true') {
          toast({
            title: "Email verified!",
            description: "Your email has been verified and you are now signed in.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You are now signed in.",
          });
        }
        navigate('/dashboard', { replace: true });
      }
    };
    
    if (!CLERK_PUBLISHABLE_KEY || !isSignedIn) {
      handleAuthRedirect();
    }
  }, [navigate, location, CLERK_PUBLISHABLE_KEY, isSignedIn]);
  
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
      // Sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
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
      if (!authData?.user) {
        toast({
          title: "Authentication failed",
          description: "Failed to authenticate user",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      // Check if user has 2FA enabled (user is now authenticated)
      const has2FA = await check2FAStatus();
      if (has2FA) {
        // Store email for 2FA verification page and redirect
        sessionStorage.setItem('auth_email', data.email);
        navigate(`/auth/2fa-verification?email=${encodeURIComponent(data.email)}`, { replace: true });
      } else {
        toast({
          title: "Login successful",
          description: "You've been signed in successfully.",
        });
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Clerk Social Login Options */}
      <ClerkSocialLogin mode="signin" />
      
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
              onVerify={handleCaptchaValidation} 
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
              <a
                href="https://discord.gg/hGPgDqYP"
                className="text-sm font-medium text-willtank-600 hover:text-willtank-700 flex items-center"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Support on Discord"
              >
                <LifeBuoy className="h-4 w-4 mr-2 text-indigo-600" />
                Contact Support (Discord)
              </a>
            </div>
            <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
              <p className="font-medium">
                Need to reset your password or ran into issues? 
                <a 
                  href="https://discord.gg/hGPgDqYP"
                  className="underline ml-1 font-bold text-willtank-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >Contact WillTank Support on Discord</a>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
