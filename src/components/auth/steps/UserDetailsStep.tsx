
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { UserDetailsInputs, userDetailsSchema } from '../SignUpSchemas';
import { fadeInUp } from '../animations';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserDetailsStepProps {
  onNext: (data: UserDetailsInputs) => void;
  isLoading?: boolean;
}

export function UserDetailsStep({ onNext, isLoading = false }: UserDetailsStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const form = useForm<UserDetailsInputs>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: UserDetailsInputs) => {
    try {
      setLocalLoading(true);
      
      // Register user with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        setLocalLoading(false);
        return;
      }
      
      // Check if the user was created successfully
      if (!authData.user) {
        toast({
          title: "Registration failed",
          description: "Could not create user account. Please try again.",
          variant: "destructive",
        });
        setLocalLoading(false);
        return;
      }

      console.log("Auth user created:", authData.user.id);

      // Store user profile with retry logic
      let profileCreated = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!profileCreated && retryCount < maxRetries) {
        try {
          // Wait a moment before trying to ensure auth is processed
          // Increase wait time with each retry
          await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
          
          // Call the store-user-profile function
          const { data: profileData, error: profileError } = await supabase.functions.invoke(
            'store-user-profile',
            {
              body: {
                user_id: authData.user.id,
                email: data.email,
                first_name: data.firstName,
                last_name: data.lastName
              }
            }
          );

          if (profileError) {
            console.error(`Error creating user profile (attempt ${retryCount + 1}):`, profileError);
            retryCount++;
            // Will retry unless max retries reached
          } else {
            console.log('User profile created:', profileData);
            profileCreated = true;
          }
        } catch (profileException) {
          console.error(`Exception in profile creation (attempt ${retryCount + 1}):`, profileException);
          retryCount++;
          // Will retry unless max retries reached
        }
      }
      
      // Even if profile creation failed after retries, continue with the flow
      // The user can still use the app without a complete profile
      if (!profileCreated) {
        console.warn("Failed to create user profile after multiple attempts. Continuing anyway.");
        toast({
          title: "Profile creation warning",
          description: "Your account was created but we had issues setting up your profile. You can continue anyway.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account registered",
          description: "Your account has been created successfully. Please check your email to verify your account.",
        });
      }
      
      // Call the parent component's onNext function with the form data
      onNext(data);
    } catch (error) {
      console.error("Error registering user:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.div key="step1" {...fadeInUp}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} disabled={isLoading || localLoading} />
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
                    <Input placeholder="Doe" {...field} disabled={isLoading || localLoading} />
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading || localLoading} />
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
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      className="pr-10"
                      {...field}
                      disabled={isLoading || localLoading}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || localLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <PasswordStrengthMeter password={field.value} />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      className="pr-10"
                      {...field}
                      disabled={isLoading || localLoading}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || localLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
            <p>Your email and password will be used for secure access. Ensure your password is strong and unique.</p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || localLoading}>
            {(isLoading || localLoading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
