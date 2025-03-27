
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function SignUp() {
  return (
    <AuthLayout 
      title="Create your WillTank account" 
      subtitle="Start securing your estate with bank-grade protection."
      rightPanel={<SecurityInfoPanel mode="signup" />}
    >
      <SignUpForm />
      
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link to="/auth/signin" className="font-medium text-willtank-600 hover:text-willtank-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
