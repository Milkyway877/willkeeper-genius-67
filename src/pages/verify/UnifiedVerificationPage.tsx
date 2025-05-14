
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Loader, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function UnifiedVerificationPage() {
  // Get type and token from URL parameters
  const { type, token } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [status, setStatus] = useState<'loading' | 'valid' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your request...');
  const [responseMessage, setResponseMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        console.log('UnifiedVerificationPage - Processing token:', token, 'type:', type);
        
        // Verify the token against the database
        const { data: verification, error } = await supabase
          .from('contact_verifications')
          .select('*, trusted_contacts(*), user_id')
          .eq('verification_token', token)
          .single();
          
        if (error || !verification) {
          console.error('Error verifying token:', error);
          setStatus('error');
          setMessage('There was an error verifying your request. The link may be invalid or expired.');
          return;
        }

        // Check if token is expired
        const expiresAt = new Date(verification.expires_at);
        if (expiresAt < new Date()) {
          setStatus('error');
          setMessage('This verification link has expired. Please ask for a new invitation.');
          return;
        }
        
        // Check if already responded
        if (verification.responded_at) {
          const responseStatus = verification.response === 'accept' ? 'success' : 'error';
          setStatus(responseStatus);
          setMessage(
            verification.response === 'accept' 
              ? 'You have already accepted this invitation. Thank you for your response.'
              : 'You have already declined this invitation.'
          );
          return;
        }
        
        // Store contact info for later use
        setContactInfo(verification.trusted_contacts);
        
        // Get user info
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, full_name')
          .eq('id', verification.user_id)
          .single();
          
        if (!userError && userData) {
          setUserInfo(userData);
        }
        
        // Token is valid, show the response interface
        setStatus('valid');
        setMessage('Please respond to this invitation below.');
        
      } catch (error) {
        console.error('Error in verification process:', error);
        setStatus('error');
        setMessage('There was an unexpected error during verification. Please try again later.');
      }
    };

    verifyToken();
  }, [token, type]);

  const handleResponse = async (accept: boolean) => {
    if (!token) return;
    
    try {
      setSubmitting(true);
      
      // Call our Edge Function to handle the verification response
      const response = await fetch(`${window.location.origin}/functions/v1/verify-trusted-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          response: accept ? 'accept' : 'decline',
          message: responseMessage
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('success');
        setMessage(accept 
          ? 'Thank you for accepting the invitation. Your response has been recorded.' 
          : 'You have declined the invitation. Your response has been recorded.');
      } else {
        throw new Error(result.message || 'Failed to process your response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setStatus('error');
      setMessage('There was an error processing your response. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render the appropriate UI based on the current status
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-center text-gray-600">Verifying your request...</p>
          </div>
        );
        
      case 'valid':
        return (
          <>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-center text-gray-700">
                {userInfo?.full_name || 'Someone'} has invited you to be their trusted contact. 
                As a trusted contact, you may be asked to verify their status if they miss check-ins.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="response-message" className="text-sm font-medium">
                  Optional message (visible to the person who invited you):
                </label>
                <Textarea
                  id="response-message"
                  placeholder="Enter an optional message..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button 
                  variant="outline" 
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleResponse(false)}
                  disabled={submitting}
                >
                  {submitting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Decline Invitation
                </Button>
                <Button 
                  variant="default"
                  onClick={() => handleResponse(true)}
                  disabled={submitting}
                >
                  {submitting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Accept Invitation
                </Button>
              </div>
            </div>
          </>
        );
        
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="font-medium text-xl mb-2">Thank You</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button variant="default" onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
          </div>
        );
        
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="font-medium text-xl mb-2">Verification Error</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button variant="default" onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Shield className="h-12 w-12 text-willtank-600" />
          </div>
          <CardTitle className="text-center">Trusted Contact Verification</CardTitle>
          <CardDescription className="text-center">
            {status === 'valid' ? 'Please respond to the invitation below' : 'Verification Portal'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
