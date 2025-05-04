
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyTrustedContact() {
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your trusted contact status...');

  useEffect(() => {
    // In a real implementation, this would call an API to verify the token
    const verifyToken = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setStatus('success');
          setMessage('You have been successfully verified as a trusted contact.');
        }, 2000);
      } catch (error) {
        console.error('Error verifying token:', error);
        setStatus('error');
        setMessage('There was an error verifying your status. The link may be invalid or expired.');
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
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
        
        <CardFooter className="flex justify-center">
          <Button variant="default" onClick={() => window.location.href = '/'}>
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
