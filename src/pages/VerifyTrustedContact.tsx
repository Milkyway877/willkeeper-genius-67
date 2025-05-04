
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
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
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

        // If verification is successful, get user name
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('full_name, first_name, last_name')
          .eq('id', verification.user_id)
          .single();
          
        if (userData) {
          const displayName = userData.full_name || 
            (userData.first_name && userData.last_name ? 
              `${userData.first_name} ${userData.last_name}` : 'A WillTank user');
          setUserName(displayName);
        }
        
        // Update verification record
        await supabase
          .from('contact_verifications')
          .update({
            responded_at: new Date().toISOString(),
            response: 'verified'
          })
          .eq('verification_token', token);
          
        // Update contact record
        if (verification.contact_type === 'trusted') {
          await supabase
            .from('trusted_contacts')
            .update({
              invitation_status: 'verified',
              invitation_responded_at: new Date().toISOString()
            })
            .eq('id', verification.contact_id);
        }
        
        // Log the verification
        await supabase
          .from('death_verification_logs')
          .insert({
            user_id: verification.user_id,
            action: 'contact_verified',
            details: {
              contact_id: verification.contact_id,
              contact_type: verification.contact_type,
              verification_token: token
            }
          });
          
        setStatus('success');
        setMessage(`You have been successfully verified as a trusted contact for ${userName}.`);
      } catch (error) {
        console.error('Error in verification process:', error);
        setStatus('error');
        setMessage('There was an unexpected error during verification. Please try again later.');
      }
    };

    verifyToken();
  }, [token]);

  const handleReturnHome = () => {
    navigate('/');
  };

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
            
            {status === 'success' && (
              <p className="mt-4 text-gray-600">
                As a trusted contact, you may be asked to verify {userName}'s status if they stop responding to their regular check-ins. This helps protect their digital legacy.
              </p>
            )}
            
            {status === 'error' && (
              <p className="mt-4 text-gray-600">
                If you believe this is a mistake, please contact the person who sent you the invitation to request a new link.
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button variant="default" onClick={handleReturnHome}>
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
