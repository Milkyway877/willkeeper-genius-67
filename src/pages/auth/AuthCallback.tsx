
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth callback param from the URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (!code) {
          throw new Error('No code parameter found in URL');
        }

        // Exchange the code for a session
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (authError) {
          throw authError;
        }

        if (data.session) {
          toast({
            title: "Authentication successful",
            description: "You're now signed in and being redirected to the dashboard.",
          });
          
          // Redirect to dashboard or intended page
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        
        toast({
          title: "Authentication failed",
          description: err.message || "Failed to complete the authentication process.",
          variant: "destructive",
        });
        
        // Redirect to sign-in on error
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        {error ? (
          <div className="text-center">
            <h1 className="mb-4 text-xl font-bold text-red-600 dark:text-red-400">Authentication Failed</h1>
            <p className="mb-4 text-gray-600 dark:text-gray-300">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to sign-in page...</p>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="mb-4 text-xl font-bold">Completing Authentication</h1>
            <div className="mb-4 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we log you in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
