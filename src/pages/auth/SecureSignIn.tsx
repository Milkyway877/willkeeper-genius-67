
import React from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import HoneypotField from '@/components/auth/HoneypotField';
import NoPasteWarning from '@/components/auth/NoPasteWarning';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

const SecureSignIn = () => {
  return (
    <AuthLayout 
      title="Sign in to WillTank" 
      subtitle="Access your secure will management platform."
      rightPanel={<SecurityInfoPanel mode="signin" />}
    >
      {/* Executor Access Banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-amber-800">Are you an Executor?</p>
              <p className="text-xs text-amber-700">Access wills with your verification codes</p>
            </div>
          </div>
          <Link to="/will-unlock">
            <Button variant="default" size="default" className="bg-amber-600 hover:bg-amber-700 text-white">
              Executor Access
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

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
