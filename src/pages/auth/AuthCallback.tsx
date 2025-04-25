import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth/email sign-in callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError("Authentication failed. Please try again.");
          navigate('/auth/signin?error=auth_callback_error', { replace: true });
          return;
        }
        
        if (data?.session) {
          // Session exists, refresh the auth context
          await refreshSession();
          
          try {
            // Check if user profile exists and is activated
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('activation_complete')
              .eq('id', data.session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error("Error fetching user profile:", profileError);
              // Continue anyway, assuming user can access the app
            }
            
            // If user is activated, redirect to dashboard
            // Otherwise redirect to account activation
            if (profileData?.activation_complete) {
              navigate('/dashboard?auth=success', { replace: true });
            } else {
              // Redirect to dashboard anyway, the AccountActivationBar will show
              navigate('/dashboard?activation=required', { replace: true });
            }
          } catch (profileFetchError) {
            console.error("Error handling profile data:", profileFetchError);
            // Still redirect to dashboard as fallback
            navigate('/dashboard', { replace: true });
          }
        } else {
          // No session, go back to sign in
          setError("No authentication session found.");
          navigate('/auth/signin', { replace: true });
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        setError("An unexpected error occurred during authentication.");
        navigate('/auth/signin?error=unknown', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    
    handleAuthCallback();
  }, [navigate, refreshSession]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Completing authentication...</p>
          </>
        ) : error ? (
          <div className="text-red-500">
            <p className="text-lg font-semibold">Authentication Error</p>
            <p>{error}</p>
            <button 
              className="mt-4 text-blue-500 hover:underline" 
              onClick={() => navigate('/auth/signin')}
            >
              Return to sign in
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
