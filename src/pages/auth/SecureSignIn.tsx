
import React from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import HoneypotField from '@/components/auth/HoneypotField';
import NoPasteWarning from '@/components/auth/NoPasteWarning';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const SecureSignIn = () => {
  return (
    <AuthLayout 
      title="Sign in to WillTank" 
      subtitle="Access your secure will management platform."
      rightPanel={<SecurityInfoPanel mode="signin" />}
    >
      <div className="relative">
        <HoneypotField name="user_email_confirmation" />
        
        <Card className="border-none shadow-none">
          <CardHeader className="space-y-1 p-0">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="mb-6">
              <NoPasteWarning />
            </div>
            <SignInForm />
            
            <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
              New to WillTank?{" "}
              <Link to="/auth/signup" className="font-bold text-willtank-600 hover:text-willtank-700">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default SecureSignIn;
