
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Captcha from '@/components/auth/Captcha';
import { useCaptcha } from '@/hooks/use-captcha';

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
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const { captchaRef, handleCaptchaValidation, validateCaptcha } = useCaptcha();
  
  const form = useForm<SignInFormInputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      password: '',
    },
  });
  
  useEffect(() => {
    // If user just completed verification, show a welcome back message
    if (verified) {
      toast({
        title: "Welcome back",
        description: "Please enter your password to continue.",
        variant: "default",
      });
    }
  }, [verified]);
  
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
      
      // First check if credentials are valid
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
      
      // Always sign out to prevent automatic login - we'll require verification
      await supabase.auth.signOut();
      
      if (authData.user) {
        // Check if user has 2FA enabled
        const { data: securityData } = await supabase
          .from('user_security')
          .select('google_auth_enabled, google_auth_secret')
          .eq('email', data.email)
          .maybeSingle();

        if (securityData?.google_auth_enabled && securityData?.google_auth_secret) {
          // If user has 2FA enabled, redirect to 2FA page
          sessionStorage.setItem('auth_email', data.email);
          navigate('/auth/two-factor');
          return;
        }
          
        // Get user profile to check verification status
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('email_verified, is_activated')
          .eq('id', authData.user.id)
          .single();
          
        const isEmailVerified = profileData?.email_verified || authData.user.email_confirmed_at !== null;
        
        if (isEmailVerified) {
          // If email is verified, send verification link for login
          // Call the send-verification function with useLink=true
          const { data: verificationData, error: emailError } = await supabase.functions.invoke('send-verification', {
            body: {
              email: data.email,
              type: 'login',
              useLink: true
            }
          });
          
          if (emailError) {
            throw new Error("Failed to send verification link");
          }
          
          toast({
            title: "Verification email sent",
            description: "Please check your email and click the link to verify your login.",
          });
          
          // Store email in session storage for verification page (NOT password)
          sessionStorage.setItem('auth_email', data.email);
          
          // Show "check email" message
          navigate(`/auth/verification?email=${encodeURIComponent(data.email)}&type=login`);
        } else {
          // If email is not verified, send a verification link
          const { data: verificationData, error: emailError } = await supabase.functions.invoke('send-verification', {
            body: {
              email: data.email,
              type: 'signup',
              useLink: true
            }
          });
          
          if (emailError) {
            throw new Error("Failed to send verification link");
          }
          
          toast({
            title: "Email verification required",
            description: "Your email has not been verified. Please check your email and click the link to verify your account.",
          });
          
          // Store email in session storage for verification page (NOT password)
          sessionStorage.setItem('auth_email', data.email);
          
          // Navigate to verification page
          navigate(`/auth/verification?email=${encodeURIComponent(data.email)}&type=signup`);
        }
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
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification', {
        body: {
          email: email,
          type: 'login',
          useLink: true
        }
      });
      
      if (emailError) {
        throw new Error("Failed to send verification link");
      }
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error("Error resending verification:", error);
      toast({
        title: "Failed to resend verification",
        description: error.message || "An unexpected error occurred. Please try again.",
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
          </div>
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="font-medium">After signing in, you'll receive a verification link via email to complete your login.</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
