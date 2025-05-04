
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
    
    handleAuthRedirect();
  }, [navigate, location]);
  
  const form = useForm<SignInFormInputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

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
      
      // Delete any expired or used verification codes for this email
      await supabase
        .from('email_verification_codes')
        .delete()
        .eq('email', data.email)
        .or(`used.eq.true,expires_at.lt.${new Date().toISOString()}`);
      
      // Generate verification code for email verification
      const verificationCode = generateVerificationCode();
      console.log("Generated verification code:", verificationCode);
      
      // Store verification code in database
      const { error: storeError } = await supabase
        .from('email_verification_codes')
        .insert({
          email: data.email,
          code: verificationCode,
          type: 'login',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiry
          used: false
        });
      
      if (storeError) {
        console.error("Error storing verification code:", storeError);
        throw new Error("Failed to process verification");
      }
      
      // Send verification code
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification', {
        body: {
          email: data.email,
          code: verificationCode,
          type: 'login'
        }
      });
      
      if (emailError) {
        console.error("Error invoking send-verification function:", emailError);
        throw new Error("Failed to send verification code");
      }
      
      console.log("Email verification code sent successfully");
      
      // Save user credentials in session storage for verification page
      sessionStorage.setItem('auth_email', data.email);
      sessionStorage.setItem('auth_password', data.password);
      
      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code.",
      });
      
      // Navigate to verification page
      navigate(`/auth/verification?email=${encodeURIComponent(data.email)}&type=login`);
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
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
            <p className="font-medium">After signing in, you'll need to verify your email with a 6-digit code.</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
