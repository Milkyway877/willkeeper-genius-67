
import React, { useState, useEffect } from 'react';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TwoFactorSecurityBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has already set up 2FA
    const checkTwoFactorStatus = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error getting current user:', userError);
          return;
        }
        
        // Check if user has dismissed this banner recently
        const lastDismissed = localStorage.getItem('2fa_banner_dismissed');
        if (lastDismissed) {
          const dismissedTime = parseInt(lastDismissed);
          const currentTime = new Date().getTime();
          
          // Show again after 7 days if still not set up
          if (currentTime - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
            setDismissed(true);
            return;
          }
        }
        
        // Check if 2FA is enabled for this user
        const { data: securityData, error: securityError } = await supabase
          .from('user_security')
          .select('google_auth_enabled')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (securityError) {
          console.error('Error checking 2FA status:', securityError);
          return;
        }
        
        // Show banner if 2FA is not enabled
        if (!securityData || !securityData.google_auth_enabled) {
          setShow(true);
        }
      } catch (error) {
        console.error('Error checking two-factor status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkTwoFactorStatus();
  }, []);
  
  const handleDismiss = () => {
    // Store dismissal time
    localStorage.setItem('2fa_banner_dismissed', new Date().getTime().toString());
    setShow(false);
    setDismissed(true);
  };
  
  const handleSetup = () => {
    // Store email in session storage (needed for 2FA setup)
    const setupTwoFactor = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email) {
          sessionStorage.setItem('auth_email', user.email);
          navigate('/auth/two-factor');
        }
      } catch (error) {
        console.error('Error preparing 2FA setup:', error);
      }
    };
    
    setupTwoFactor();
  };

  if (loading || !show || dismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Security Recommendation</AlertTitle>
      <AlertDescription className="flex flex-col md:flex-row md:items-center justify-between">
        <span className="text-amber-700 mb-2 md:mb-0">
          Your account doesn't have two-factor authentication enabled. Enable 2FA for additional security.
        </span>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button 
            size="sm" 
            variant="outline"
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
            onClick={handleDismiss}
          >
            Remind me later
          </Button>
          <Button 
            size="sm" 
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleSetup}
          >
            Enable 2FA
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
