
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserDetailsStep } from './steps/UserDetailsStep';

export function SignUpForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleUserDetailsSubmit = async (data) => {
    setIsLoading(true);
    
    try {
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
        setIsLoading(false);
        return;
      }
      
      // Success message
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      // Redirect to sign in page
      setTimeout(() => {
        navigate('/auth/signin');
      }, 2000);
    } catch (error) {
      console.error("Error registering user:", error);
      
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
      <UserDetailsStep onNext={handleUserDetailsSubmit} isLoading={isLoading} />
    </div>
  );
}
