
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function SignIn() {
  return (
    <AuthLayout 
      title="Sign in to WillTank" 
      subtitle="Access your secure will management platform."
      rightPanel={<SecurityInfoPanel mode="signin" />}
    >
      <SignInForm />
      
      <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
        New to WillTank?{" "}
        <Link to="/auth/signup" className="font-bold text-willtank-600 hover:text-willtank-700">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
