
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInFormInputs = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check for redirects from email verification
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session && !error) {
        // User is already logged in
        toast({
          title: "Welcome back!",
          description: "You are now signed in.",
        });
        navigate('/dashboard');
      }
    };
    
    handleAuthRedirect();
  }, [navigate]);
  
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
      
      // Sign in with email and password
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
      
      if (!authData.user) {
        toast({
          title: "Authentication failed",
          description: "User not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Show success toast
      toast({
        title: "Sign in successful",
        description: "Redirecting to your dashboard...",
      });
      
      // Redirect to dashboard
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
                <Input type="email" placeholder="john.doe@example.com" className="rounded-lg" {...field} />
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
                    className="pr-10 rounded-lg"
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
        
        <div className="space-y-2 mt-6">
          <div className="text-center">
            <Link 
              to="/auth/recover" 
              className="text-sm font-medium text-willtank-600 hover:text-willtank-700"
            >
              Forgot password? Reset it here →
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="font-medium">Make sure to use the email address you registered with. If you've forgotten your password, you can recover it using the link above.</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
