
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
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
          .single();

        if (error) {
          console.error("Error checking activation status:", error);
          setIsActivated(false);
        } else {
          setIsActivated(data?.activation_complete || false);
        }
      } catch (error) {
        console.error("Error checking activation status:", error);
        setIsActivated(false);
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
  if (isLoading || (user && checkingActivation)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
};
