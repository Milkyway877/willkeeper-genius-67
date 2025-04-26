
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createWelcomeNotification, createSystemNotification } from '@/services/notificationService';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    
    if (isVerified) {
      countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            navigate('/dashboard', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [isVerified, navigate]);

  useEffect(() => {
    const createWelcomeNotifications = async () => {
      try {
        console.log("Creating welcome notifications for new user");
        
        // Send welcome notification
        await createWelcomeNotification();
        
        // Send getting started instructions
        await createSystemNotification('info', {
          title: "Getting Started with WillTank",
          description: "Follow our quick guide to set up your account and create your first will."
        });
        
        // Send a security reminder
        await createSystemNotification('security', {
          title: "Secure Your Account",
          description: "For maximum security, we recommend enabling two-factor authentication in settings."
        });
        
        return true;
      } catch (notifError) {
        console.error("Error creating welcome notifications:", notifError);
        return false;
      }
    };

    const handleEmailVerification = async () => {
      try {
        // Check if this is coming from an email verification link
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Failed to verify authentication state.");
          setIsProcessing(false);
          return;
        }

        // If session exists, the email has been verified
        if (data?.session) {
          // Create notifications for the user
          const notificationsCreated = await createWelcomeNotifications();
          
          if (notificationsCreated) {
            console.log("Welcome notifications created successfully");
          }
          
          toast({
            title: "Email Verified Successfully!",
            description: "Welcome to WillTank. Your secure will management journey begins now.",
          });
          
          // Set verified state and let countdown handle redirect
          setIsVerified(true);
          setIsProcessing(false);
        } else {
          // Handle any params from the URL
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken) {
            // If we have tokens in the URL, try to exchange them for a session
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (setSessionError) {
              console.error("Set session error:", setSessionError);
              setError("Failed to verify your email. Please try signing in again.");
              setIsProcessing(false);
              return;
            }
            
            // Create notifications for the user
            const notificationsCreated = await createWelcomeNotifications();
            
            if (notificationsCreated) {
              console.log("Welcome notifications created successfully");
            }
            
            toast({
              title: "Email Verified Successfully!",
              description: "Welcome to WillTank. Your secure will management journey begins now.",
            });
            
            // Set verified state and let countdown handle redirect
            setIsVerified(true);
            setIsProcessing(false);
          } else {
            // No session, no tokens - something went wrong
            setError("Authentication failed. Please try signing in again.");
            setIsProcessing(false);
            
            // Redirect to sign in after a delay
            setTimeout(() => {
              navigate('/auth/signin', { replace: true });
            }, 3000);
          }
        }
      } catch (e) {
        console.error("Authentication callback error:", e);
        setError("An unexpected error occurred. Please try signing in again.");
        setIsProcessing(false);
        
        // Redirect to sign in after a delay
        setTimeout(() => {
          navigate('/auth/signin', { replace: true });
        }, 3000);
      }
    };

    handleEmailVerification();
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-willtank-600 animate-spin" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Verifying your email...</h1>
            <p className="mt-2 text-gray-600">Please wait while we complete the process.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Email Verified!</h1>
            <p className="mt-2 text-gray-600">Welcome to WillTank. Your secure will management journey begins now.</p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">Redirecting you to your dashboard in <span className="font-bold text-black">{countdown}</span> seconds...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Verification Failed</h1>
            <p className="mt-2 text-gray-600">{error}</p>
            <p className="mt-4 text-gray-600">Redirecting you to the sign in page...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
