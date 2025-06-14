
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const form = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Check if we have valid reset tokens from URL
  useEffect(() => {
    const checkResetSession = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (!accessToken || !refreshToken) {
        console.log('No reset tokens found in URL');
        setTokenValid(false);
        return;
      }

      try {
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Invalid reset tokens:', error);
          setTokenValid(false);
          return;
        }

        if (data.session) {
          console.log('Valid reset session established');
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Error validating reset tokens:', error);
        setTokenValid(false);
      }
    };

    checkResetSession();
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordInputs) => {
    if (tokenValid !== true) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired. Please request a new one.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Update user's password
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been updated. You can now sign in with your new password.",
      });
      
      // Sign out the user and redirect to sign in
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate('/auth/signin?message=password-reset-success');
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      toast({
        title: "Password reset failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (tokenValid === null) {
    return (
      <AuthLayout 
        title="Validating reset link..." 
        subtitle="Please wait while we verify your password reset link."
        rightPanel={<SecurityInfoPanel mode="recover" />}
      >
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-willtank-600"></div>
        </div>
      </AuthLayout>
    );
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <AuthLayout 
        title="Invalid reset link" 
        subtitle="This password reset link is invalid or has expired."
        rightPanel={<SecurityInfoPanel mode="recover" />}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This password reset link is invalid, expired, or has already been used. 
            Please request a new password reset link.
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 space-y-4">
          <Link to="/auth/recover">
            <Button className="w-full">
              Request New Reset Link
            </Button>
          </Link>
          
          <div className="text-center">
            <Link 
              to="/auth/signin" 
              className="text-sm font-medium text-willtank-600 hover:text-willtank-700"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Set new password" 
      subtitle="Create a strong password for your WillTank account."
      rightPanel={<SecurityInfoPanel mode="recover" />}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-700">New Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter new password" 
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
                <p className="text-xs text-gray-500 mt-1">
                  Must contain uppercase, lowercase, number, and special character
                </p>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-gray-700">Confirm New Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm new password" 
                      className="pr-10 rounded-lg border-2 border-gray-300"
                      {...field} 
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Password...
              </>
            ) : (
              <>
                Update Password <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="font-medium">Your new password will take effect immediately after updating.</p>
          </div>
          
          <div className="text-center text-sm">
            <Link 
              to="/auth/signin" 
              className="font-medium text-willtank-600 hover:text-willtank-700"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
