
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyTrustedContact() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your trusted contact status...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        console.log('VerifyTrustedContact - Processing token:', token);
        // Verify the token against the database
        const { data: verification, error } = await supabase
          .from('contact_verifications')
          .select('*, trusted_contacts(*)')
          .eq('verification_token', token)
          .single();
          
        if (error || !verification) {
          console.error('Error verifying token:', error);
          setStatus('error');
          setMessage('There was an error verifying your status. The link may be invalid or expired.');
          return;
        }

        // Check if token is expired
        const expiresAt = new Date(verification.expires_at);
        if (expiresAt < new Date()) {
          setStatus('error');
          setMessage('This verification link has expired. Please ask for a new invitation.');
          return;
        }
        
        // If token is valid, directly proceeding to verification response
        console.log('VerifyTrustedContact - Valid token, navigating to:', `/verify/invitation/${token}`);
        
        // Instead of redirecting, show success and provide button to proceed
        setStatus('success');
        setMessage('Your verification token is valid. Please click below to respond to the invitation.');
        
      } catch (error) {
        console.error('Error in verification process:', error);
        setStatus('error');
        setMessage('There was an unexpected error during verification. Please try again later.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleProceedToResponse = () => {
    console.log('VerifyTrustedContact - User clicked to proceed to response page');
    // This needs to match the path pattern in both routers
    navigate(`/verify/invitation/${token}`);
  };

  // Display a loading screen while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            {status === 'loading' && <Loader className="h-5 w-5 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            Trusted Contact Verification
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' ? 'Please wait while we verify your status...' : 'Verification complete'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className={`text-center p-6 ${status === 'success' ? 'text-green-700' : status === 'error' ? 'text-red-700' : 'text-blue-700'}`}>
            {message}
          </div>
        </CardContent>
        
        {status === 'success' && (
          <CardFooter className="flex justify-center">
            <Button variant="default" onClick={handleProceedToResponse}>
              Respond to Invitation
            </Button>
          </CardFooter>
        )}
        
        {status === 'error' && (
          <CardFooter className="flex justify-center">
            <Button variant="default" onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
