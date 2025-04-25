
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { supabase } from '@/integrations/supabase/client';

interface RouteGuardProps {
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

export function RouteGuard({ 
  requireAuth = true, 
  requireOnboarding = true 
}: RouteGuardProps) {
  const { user, profile, loading } = useUserProfile();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user data is still loading
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  if (isLoading) {
    // Show a loading indicator while checking auth status
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Authentication check
  if (requireAuth && !user) {
    // Redirect to login if auth is required but user is not logged in
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // Onboarding check
  if (requireAuth && requireOnboarding && user && profile && !profile.is_activated) {
    // Redirect to onboarding if user is logged in but hasn't completed onboarding
    // Skip if the user is already on the onboarding page
    if (!location.pathname.includes('/auth/onboarding')) {
      return <Navigate to="/auth/onboarding" replace />;
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && location.pathname.startsWith('/auth/') && 
      !location.pathname.includes('/auth/onboarding') &&
      !location.pathname.includes('/auth/verify')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
