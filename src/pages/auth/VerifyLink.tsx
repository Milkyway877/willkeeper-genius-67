import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function VerifyLink() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const type = searchParams.get('type');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'verified' | 'failed'>('pending');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email || !type) {
      setVerificationStatus('failed');
      toast({
        title: 'Verification Failed',
        description: 'Missing required parameters.',
        variant: 'destructive',
      });
      return;
    }

    const verifyEmail = async () => {
      setVerificationStatus('verifying');
      try {
        // Call the edge function to verify the token
        const { data, error } = await supabase.functions.invoke('verify-email', {
          body: {
            token,
            email,
            type,
          },
        });

        if (error) {
          console.error('Function invocation error:', error);
          setVerificationStatus('failed');
          toast({
            title: 'Verification Failed',
            description: error.message || 'An error occurred during verification.',
            variant: 'destructive',
          });
          return;
        }

        if (data?.status === 'verified') {
          setVerificationStatus('verified');
          toast({
            title: 'Email Verified',
            description: data.message || 'Your email has been successfully verified.',
          });

          // Attempt auto-login
          const authEmail = sessionStorage.getItem('auth_email');
          const authPassword = sessionStorage.getItem('auth_password');

          if (authEmail && authPassword) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: authEmail,
              password: authPassword,
            });

            if (signInError) {
              console.error('Auto sign-in error:', signInError);
              toast({
                title: 'Auto Sign-in Failed',
                description: 'Please sign in manually.',
                variant: 'destructive',
              });
              navigate('/auth/signin');
            } else {
              toast({
                title: 'Signed in',
                description: 'Successfully signed in after verification.',
              });
              navigate('/dashboard');
            }

            sessionStorage.removeItem('auth_email');
            sessionStorage.removeItem('auth_password');
          } else {
            navigate('/auth/signin');
          }
        } else {
          setVerificationStatus('failed');
          toast({
            title: 'Verification Failed',
            description: data?.message || 'Email verification failed.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setVerificationStatus('failed');
        toast({
          title: 'Verification Error',
          description: err.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    };

    verifyEmail();
  }, [token, email, type, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {verificationStatus === 'verified' ? 'Email Verified' : 'Verify Email'}
          </CardTitle>
          <CardDescription className="text-gray-500 text-center">
            {verificationStatus === 'pending' && 'Verifying your email address...'}
            {verificationStatus === 'verifying' && 'Please wait while we verify your email.'}
            {verificationStatus === 'verified' && 'Your email has been successfully verified!'}
            {verificationStatus === 'failed' && 'Email verification failed.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {verificationStatus === 'pending' && <Loader2 className="h-6 w-6 animate-spin" />}
          {verificationStatus === 'verifying' && <Loader2 className="h-6 w-6 animate-spin" />}
          {verificationStatus === 'verified' && <CheckCircle className="h-6 w-6 text-green-500" />}
          {verificationStatus === 'failed' && <XCircle className="h-6 w-6 text-red-500" />}
        </CardContent>
        <CardFooter className="flex justify-center">
          {verificationStatus === 'failed' && (
            <Button variant="outline" onClick={() => navigate('/auth/signin')}>
              Return to Sign In
            </Button>
          )}
          {verificationStatus === 'verified' && (
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
