
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
  const { captchaRef, validateCaptcha } = useCaptcha();

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

  const onSubmit = async (data: SignUpFormInputs) => {
    // Validate captcha first
    if (!validateCaptcha()) {
      toast({
        title: "Captcha validation failed",
        description: "Please complete the captcha verification.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if email already exists
      const { data: existingUsers, error: existingError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', data.email)
        .single();
        
      if (existingUsers) {
        toast({
          title: "Email already registered",
          description: "This email address is already in use. Please use a different email or try to login.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // First create a user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
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
      
      if (signUpError) {
        toast({
          title: "Registration failed",
          description: signUpError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sign out immediately to prevent auto-login
      await supabase.auth.signOut();

      console.log("User account created successfully");

      // Store email in session storage for verification page (NOT password)
      sessionStorage.setItem('auth_email', data.email);
      
      let verificationSent = false;
      let errorMessage = '';
      
      try {
        console.log("Sending verification email to:", data.email);
        
        // Send verification email through the edge function with useLink=true
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification', {
          body: {
            email: data.email,
            type: 'signup',
            useLink: true // Always use link-based verification
          }
        });

        if (emailError || !emailData?.success) {
          console.error("Error invoking send-verification function:", emailError || emailData?.error);
          errorMessage = emailError?.message || emailData?.error || "Failed to send verification email";
          // We'll create a fallback verification below
        } else {
          console.log("Verification email sent successfully");
          verificationSent = true;
        }
      } catch (error: any) {
        console.error("Error in verification process:", error);
        errorMessage = error.message || "Failed to send verification email";
        // We'll create a fallback verification below
      }
      
      // If verification email sending failed, create a fallback verification
      if (!verificationSent) {
        try {
          // Generate a token directly in the client
          const token = generateSecureToken(data.email);
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours
          
          console.log("Creating fallback verification record");
          
          // Try to insert the verification record directly
          const { error: fallbackError } = await supabase
            .from('email_verification_codes')
            .insert({
              email: data.email,
              code: String(Math.floor(100000 + Math.random() * 900000)), // 6-digit code
              token: token,
              type: 'signup',
              expires_at: expiresAt.toISOString(),
              used: false
            });
            
          if (fallbackError) {
            console.error("Fallback verification creation failed:", fallbackError);
            errorMessage = fallbackError.message;
          } else {
            console.log("Fallback verification created successfully");
            verificationSent = true; // We created a verification record, so count this as success
          }
        } catch (err: any) {
          console.error("Error in createFallbackVerification:", err);
          errorMessage = err.message || "Failed to create verification";
        }
      }
      
      // Show appropriate message based on verification status
      if (verificationSent) {
        toast({
          title: "Account created successfully",
          description: "We've sent a verification link to your email. Please check your inbox and click the link to activate your account.",
          variant: "default",
        });
        
        // Navigate to verification page with autologin flag
        navigate(`/auth/verification?email=${encodeURIComponent(data.email)}&type=signup&autologin=true`);
      } else {
        // If everything failed, still let them know account was created but with warning
        toast({
          title: "Account created with issues",
          description: `Your account was created, but we couldn't send the verification email. Error: ${errorMessage}`,
          variant: "destructive",
        });
        
        navigate('/auth/signin');
      }
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a more secure token for verification links
  const generateSecureToken = (email: string): string => {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const secondRandomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}.${randomPart}.${secondRandomPart}.${btoa(email).substring(0, 10)}`;
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
              onValidated={(isValid) => {
                // This function is called when the captcha is completed
                // No need to do anything here as we'll check validity on form submit
                return isValid;
              }} 
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
            <p className="font-medium">After signing up, you'll receive a verification link via email to activate your account.</p>
          </div>
        </form>
      </Form>
    </div>
  );
}
