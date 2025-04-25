import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Captcha from '@/components/auth/Captcha';
import { useCaptcha } from '@/hooks/use-captcha';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormInputs = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { captchaRef, handleCaptchaValidation } = useCaptcha();

  const form = useForm<SignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const onSubmit = async (data: SignUpFormInputs) => {
    setIsLoading(true);
    
    try {
      const verificationCode = generateVerificationCode();
      
      // Send verification email
      const emailResponse = await supabase.functions.invoke('send-verification', {
        body: {
          email: data.email,
          code: verificationCode,
          type: 'signup'
        }
      });

      if (emailResponse.error) {
        throw new Error(emailResponse.error.message);
      }

      // Store verification code in Supabase
      const { error: verificationError } = await supabase
        .from('email_verification_codes')
        .insert({
          email: data.email,
          code: verificationCode,
          type: 'signup',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiry
        });

      if (verificationError) {
        throw verificationError;
      }

      // Sign up the user
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`
          },
        },
      });
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already in use')) {
          toast({
            title: "Email already registered",
            description: "This email address is already in use. Please use a different email or try to login.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification code.",
      });
      
      // Navigate to verification page with email
      navigate(`/auth/verification?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Error during signup:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" className="rounded-lg" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" className="rounded-lg" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-700">Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" className="rounded-lg" {...field} disabled={isLoading} />
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
                      placeholder="••••••••••••" 
                      className="pr-10 rounded-lg"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-700">Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      className="pr-10 rounded-lg"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200 mt-4">
            <p className="font-medium">After signing up, you'll receive an email verification link. Please verify your email to access your account.</p>
          </div>
        </form>
      </Form>
    </div>
  );
}
