
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClerkEmailVerification() {
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const navigate = useNavigate();
  
  const handleContinueToDashboard = async () => {
    try {
      if (signIn?.status === "complete" || signUp?.status === "complete") {
        await setActive({ session: signIn?.createdSessionId || signUp?.createdSessionId });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error setting active session:', err);
    }
  };
  
  return (
    <AuthLayout 
      title="Verify your email" 
      subtitle="Check your inbox to complete the verification process."
      rightPanel={<SecurityInfoPanel mode="verification" />}
    >
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>We need to verify your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-green-800 flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Verification email sent</h3>
              <p className="mt-1">
                Please check your email inbox and follow the verification link we sent you.
                If you don't see it, check your spam folder.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleContinueToDashboard}
            className="w-full"
          >
            Continue to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
