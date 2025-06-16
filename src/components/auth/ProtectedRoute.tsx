
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { isInLovablePreview } from '@/utils/iframeDetection';
import { IframeSafeAuth } from './IframeSafeAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const inPreview = isInLovablePreview();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If in preview and not signed in, show iframe-safe auth instead of redirecting
  if (inPreview && !isSignedIn) {
    return (
      <IframeSafeAuth fallbackMessage="This protected area requires authentication. Please open in a new tab to sign in and access your account.">
        {children}
      </IframeSafeAuth>
    );
  }

  // For non-preview environments, use normal redirect behavior
  if (!isSignedIn) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
}
