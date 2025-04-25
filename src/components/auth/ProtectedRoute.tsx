
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [isActivated, setIsActivated] = useState<boolean | null>(null);
  const [checkingActivation, setCheckingActivation] = useState(true);

  useEffect(() => {
    const checkActivation = async () => {
      if (!user) {
        setCheckingActivation(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('activation_complete')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking activation status:", error);
          // Even if there's an error, allow access as a fallback
          setIsActivated(true);
        } else {
          setIsActivated(data?.activation_complete ?? false);
        }
      } catch (error) {
        console.error("Error checking activation status:", error);
        // Even if there's an error, allow access as a fallback
        setIsActivated(true);
      } finally {
        setCheckingActivation(false);
      }
    };

    if (user) {
      checkActivation();
    } else {
      setCheckingActivation(false);
    }
  }, [user]);

  // Show loading state while checking auth or activation status
  if (authLoading || (user && checkingActivation)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};
