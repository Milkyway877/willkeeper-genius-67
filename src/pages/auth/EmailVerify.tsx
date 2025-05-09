
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmailVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token and type from URL params
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const type = searchParams.get('type') || 'signup';
        
        if (!token) {
          setError('Verification token is missing');
          setLoading(false);
          return;
        }
        
        console.log("Verifying token:", token);
        
        // Get email from token
        const { data, error: validationError } = await supabase
          .from('email_verification_codes')
          .select('email, type, expires_at')
          .eq('token', token)
          .eq('used', false)
          .single();
        
        if (validationError || !data) {
          console.error('Error validating token:', validationError);
          setError('Invalid or expired verification token');
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        if (new Date(data.expires_at) < new Date()) {
          console.error('Token expired:', data.expires_at);
          setError('This verification link has expired. Please request a new one.');
          setLoading(false);
          return;
        }
        
        // Save email for later use
        setEmail(data.email);
        
        // Mark the verification code as used
        await supabase
          .from('email_verification_codes')
          .update({ used: true })
          .eq('token', token);
        
        // Get the user associated with this email
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', data.email)
          .single();
        
        if (userError || !userData) {
          console.error('Error finding user:', userError);
          setError('Could not find your user account');
          setLoading(false);
          return;
        }
        
        // Update the user's email_verified status
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            email_verified: true,
            is_activated: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', data.email);
        
        if (updateError) {
          console.error('Error updating user profile:', updateError);
          setError('Could not verify your email');
          setLoading(false);
          return;
        }
        
        // Set success state
        setSuccess(true);
        
        // Show success message
        toast({
          title: "Email verified successfully",
          description: "Your email has been verified. You can now login to your account.",
          variant: "default",
        });
        
        // Store email in sessionStorage for login
        sessionStorage.setItem('auth_email', data.email);
        
        // Automatically redirect to login
        setTimeout(() => {
          // For signup, go to dashboard after verification
          if (type === 'signup') {
            navigate('/dashboard?verified=true&email=' + encodeURIComponent(data.email));
          } else {
            // For other verification types, go to login
            navigate('/auth/signin?verified=true&email=' + encodeURIComponent(data.email));
          }
        }, 2000);
      } catch (error) {
        console.error('Error during email verification:', error);
        setError('An unexpected error occurred during verification');
      } finally {
        setLoading(false);
      }
    };
    
    verifyEmail();
  }, [location.search, navigate]);

  const handleReturnToLogin = () => {
    if (email) {
      navigate(`/auth/signin?email=${encodeURIComponent(email)}`);
    } else {
      navigate('/auth/signin');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 text-willtank-600 animate-spin" />
          <p className="mt-4 text-gray-600">Verifying your email address...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-8">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            <p className="font-medium">Verification failed</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <Button 
            variant="default"
            className="mt-4"
            onClick={handleReturnToLogin}
          >
            Return to login
          </Button>
        </div>
      );
    }
    
    if (success) {
      return (
        <div className="text-center py-8">
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
            <p className="font-medium">Email verified successfully!</p>
            <p className="text-sm mt-1">You'll be redirected automatically in a few seconds...</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button 
              variant="outline"
              onClick={handleReturnToLogin}
            >
              Go to login
            </Button>
            <Button 
              variant="default"
              onClick={handleGoToDashboard}
            >
              Go to dashboard
            </Button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">Email Verification</h1>
            <p className="text-gray-500 text-sm mt-1">Verifying your email address</p>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
