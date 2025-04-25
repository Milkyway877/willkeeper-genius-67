
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import HoneypotField from './HoneypotField';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { useToast } from '@/hooks/use-toast';
import NoPasteWarning from './NoPasteWarning';
import Captcha from './Captcha';
import { useCaptcha } from '@/hooks/use-captcha';
import { signUpSchema } from './SignUpSchemas';
import { sendVerificationEmail } from '@/utils/email';
import { AlertCircle } from 'lucide-react';

export function SignUpForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { captchaRef, validateCaptcha } = useCaptcha();
  
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirm: '',
      honeypot: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    try {
      // Reset any previous errors
      setVerificationError(null);
      setIsLoading(true);

      // Check for honeypot field
      if (values.honeypot) {
        toast({
          title: "Error",
          description: "Form submission failed. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate CAPTCHA
      const isCaptchaValid = await validateCaptcha();
      if (!isCaptchaValid) {
        toast({
          title: "CAPTCHA Verification Failed",
          description: "Please complete the CAPTCHA verification.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // First check if user already exists
      try {
        // Use the Supabase query API to check for existing users
        const { data, error } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('email', values.email)
          .maybeSingle();

        if (error) {
          console.error("Error checking for existing user:", error);
          // Continue with signup attempt
        } else if (data) {
          // If we found a user with this email, show an error
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } catch (checkError) {
        console.error("Error during user existence check:", checkError);
        // Continue with signup attempt
      }

      // Create the user in Supabase auth but disable auto confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          // Important: disable email confirmation so we can handle it ourselves
          emailRedirectTo: null,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          }
        }
      });

      if (authError) {
        console.error("Auth error during signup:", authError);
        
        // Check for specific error types
        if (authError.message.includes("User already registered")) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error creating account",
            description: authError.message || "Failed to create account. Please try again.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      // Send our custom verification email
      try {
        console.log("Attempting to send verification email to:", values.email);
        const { success, error } = await sendVerificationEmail(
          values.email,
          'signup',
          values.firstName
        );

        if (!success) {
          console.error("Email sending error:", error);
          // Store the error for display but don't stop account creation
          setVerificationError(error?.message || "Could not send verification email. Please try again later.");
          
          // Even with email error, we want to redirect to verification page
          // where they can request a new code
          navigate(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }
        
        // Success! Redirect to verification page
        toast({
          title: "Account created",
          description: "Please check your email for a verification code.",
        });
        
        // Redirect to the email verification page
        navigate(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);
        
        // Store the error for display but don't stop account creation
        setVerificationError(emailError?.message || "Could not send verification email. Please try again later.");
        
        // Even with email error, we want to redirect to verification page
        // where they can request a new code
        navigate(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {verificationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error sending verification email</p>
              <p className="text-sm">{verificationError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
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
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="john.doe@example.com" 
                  {...field} 
                />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                    onPaste={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Paste not allowed",
                        description: "For security, please type your password.",
                        variant: "destructive",
                      });
                    }}
                  />
                  {field.value && <PasswordStrengthMeter password={field.value} />}
                  {field.value && <NoPasteWarning />}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...field}
                  onPaste={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Paste not allowed",
                      description: "For security, please type your password.",
                      variant: "destructive",
                    });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <HoneypotField control={form.control} />
        
        <Captcha ref={captchaRef} />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
