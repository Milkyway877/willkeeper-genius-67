
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function VerifyEmail() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  
  // Effect to redirect after verification is complete
  useEffect(() => {
    if (isLoaded) {
      // If the user is already signed in after verification, send them to dashboard
      if (isSignedIn) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, navigate]);
  
  // Show loading state while verification is being processed
  return (
    <AuthLayout 
      title="Verifying your email" 
      subtitle="Please wait while we verify your email address..."
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="text-gray-600">This may take a few moments</p>
      </div>
    </AuthLayout>
  );
}
