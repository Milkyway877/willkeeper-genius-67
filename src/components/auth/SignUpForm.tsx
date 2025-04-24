
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

export function SignUpForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);

      // Check for honeypot field
      if (values.honeypot) {
        toast({
          title: "Error",
          description: "Form submission failed. Please try again.",
          variant: "destructive",
        });
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
        return;
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
        toast({
          title: "Error creating account",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      // Send our custom verification email
      await sendVerificationEmail(
        values.email,
        'signup',
        values.firstName
      );
      
      // Success! Redirect to verification page
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
      
      // Redirect to the email verification page
      navigate(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
