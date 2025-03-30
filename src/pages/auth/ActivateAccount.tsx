
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ActivateAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');
  const navigate = useNavigate();

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Invalid activation link. Please request a new one.');
          return;
        }

        // In a real implementation, you would validate the token with your backend
        // For demo purposes, we'll just simulate success after a delay
        setTimeout(() => {
          setStatus('success');
          setMessage('Your account has been successfully activated! You can now login.');
        }, 2000);
      } catch (error) {
        console.error('Error activating account:', error);
        setStatus('error');
        setMessage('An error occurred while activating your account. Please try again later.');
      }
    };

    activateAccount();
  }, [searchParams]);

  const handleRedirect = () => {
    navigate('/auth/login');
  };

  return (
    <AuthLayout title="Account Activation">
      <div className="text-center space-y-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Account Activated!</h2>
            <p className="text-gray-600">{message}</p>
            <Button onClick={handleRedirect} className="mt-4">
              Proceed to Login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Activation Failed</h2>
            <p className="text-gray-600">{message}</p>
            <Button onClick={handleRedirect} className="mt-4" variant="outline">
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ActivateAccount;
