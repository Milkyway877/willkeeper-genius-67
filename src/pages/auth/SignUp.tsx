
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function SignUp() {
  return (
    <AuthLayout 
      title="Create your WillTank account" 
      subtitle="Join our secure platform and start protecting your legacy with bank-grade encryption."
      rightPanel={<SecurityInfoPanel mode="signup" />}
    >
      <SignUpForm />
      
      <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
        Already have an account?{" "}
        <Link to="/auth/signin" className="font-bold text-willtank-600 hover:text-willtank-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
