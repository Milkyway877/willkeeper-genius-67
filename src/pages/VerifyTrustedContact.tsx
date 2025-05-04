
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyTrustedContact() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'expired' | 'success' | 'declined' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get the response from URL params if available
  const responseParam = searchParams.get('response');
  
  useEffect(() => {
    if (token) {
      checkVerification();
    } else {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification token');
      setLoading(false);
    }
  }, [token]);
  
  useEffect(() => {
    if (verification && responseParam) {
      handleResponse(responseParam as 'accept' | 'decline');
    }
  }, [verification, responseParam]);

  const checkVerification = async () => {
    try {
      setLoading(true);
      
      // Check the verification token
      const { data, error } = await supabase
        .from('contact_verifications')
        .select('*, trusted_contacts(*)')
        .eq('verification_token', token)
        .single();
        
      if (error || !data) {
        console.error('Error or no verification found:', error);
        setVerificationStatus('error');
        setErrorMessage('Invalid verification token or expired');
        return;
      }
      
      // Check if already responded
      if (data.responded_at) {
        setVerificationStatus(data.response === 'accept' ? 'success' : 'declined');
        setVerification(data);
        return;
      }
      
      // Check if expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        setVerificationStatus('expired');
        setVerification(data);
        return;
      }
      
      setVerification(data);
      setVerificationStatus('pending');
    } catch (error) {
      console.error('Error checking verification:', error);
      setVerificationStatus('error');
      setErrorMessage('Error checking verification status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResponse = async (response: 'accept' | 'decline') => {
    try {
      setProcessing(true);
      
      // Call the verify-trusted-contact edge function
      const res = await fetch(`${window.location.origin}/functions/v1/verify-trusted-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          response
        })
      });
      
      const result = await res.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error processing verification');
      }
      
      setVerificationStatus(response === 'accept' ? 'success' : 'declined');
    } catch (error) {
      console.error('Error processing response:', error);
      setVerificationStatus('error');
      setErrorMessage('Failed to process your response. Please try again later.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-willtank-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Checking Verification...</h2>
          <p className="text-gray-500">Please wait while we validate your verification token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 bg-willtank-50 p-3 rounded-full inline-block">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          
          {verificationStatus === 'pending' && (
            <>
              <h2 className="text-2xl font-semibold mb-2">Trusted Contact Verification</h2>
              <p className="text-gray-600 mb-6">
                {verification?.trusted_contacts?.name 
                  ? `${verification.trusted_contacts.name}, you have been named as a trusted contact by a WillTank user.`
                  : 'You have been named as a trusted contact by a WillTank user.'}
              </p>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Would you like to accept this role?</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleResponse('accept')}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleResponse('decline')}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Decline
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {verificationStatus === 'success' && (
            <>
              <h2 className="text-2xl font-semibold text-green-600 mb-2">Verification Successful</h2>
              <div className="mx-auto mb-6 bg-green-50 p-3 rounded-full inline-block">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-gray-600 mb-4">
                Thank you for accepting your role as a trusted contact. You will be notified if the user misses check-ins and may be asked to verify their status.
              </p>
              <Button onClick={() => navigate('/')}>Return to Homepage</Button>
            </>
          )}
          
          {verificationStatus === 'declined' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">Invitation Declined</h2>
              <div className="mx-auto mb-6 bg-gray-100 p-3 rounded-full inline-block">
                <XCircle className="h-12 w-12 text-gray-500" />
              </div>
              <p className="text-gray-600 mb-4">
                You have declined the invitation to be a trusted contact. If this was a mistake, please contact the person who invited you.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>Return to Homepage</Button>
            </>
          )}
          
          {verificationStatus === 'expired' && (
            <>
              <h2 className="text-2xl font-semibold text-amber-600 mb-2">Verification Expired</h2>
              <p className="text-gray-600 mb-4">
                This verification link has expired. Please ask the user to send you a new verification link.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>Return to Homepage</Button>
            </>
          )}
          
          {verificationStatus === 'error' && (
            <>
              <h2 className="text-2xl font-semibold text-red-600 mb-2">Verification Error</h2>
              <p className="text-gray-600 mb-4">
                {errorMessage || 'There was an error processing your verification. Please try again later.'}
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>Return to Homepage</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
