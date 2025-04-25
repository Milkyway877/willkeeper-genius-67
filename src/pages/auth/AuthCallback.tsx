import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth/email sign-in callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          navigate('/auth/signin?error=auth_callback_error');
          return;
        }
        
        if (data?.session) {
          // Session exists, refresh the auth context
          await refreshSession();
          
          // Check if user profile exists and is activated
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('activation_complete')
            .eq('id', data.session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching user profile:", profileError);
          }
          
          // If user is activated, redirect to dashboard
          // Otherwise redirect to account activation
          if (profileData?.activation_complete) {
            navigate('/dashboard?auth=success');
          } else {
            // Redirect to dashboard anyway, the AccountActivationBar will show
            navigate('/dashboard?activation=required');
          }
        } else {
          // No session, go back to sign in
          navigate('/auth/signin');
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        navigate('/auth/signin?error=unknown');
      }
    };
    
    handleAuthCallback();
  }, [navigate, refreshSession]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}
