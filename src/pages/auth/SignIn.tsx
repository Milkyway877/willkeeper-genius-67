
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignIn } from "@clerk/clerk-react";
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function SignInPage() {
  return (
    <AuthLayout 
      title="Sign in to WillTank" 
      subtitle="Access your secure will management platform."
      rightPanel={<SecurityInfoPanel mode="signin" />}
    >
      <SignIn 
        path="/auth/signin" 
        signUpUrl="/auth/signup"
        redirectUrl="/dashboard"
        appearance={{
          elements: {
            formButtonPrimary: "bg-black hover:bg-gray-800 text-white rounded-xl transition-all duration-200 font-medium",
            formFieldInput: "rounded-lg border-2 border-gray-300",
            footerActionLink: "font-medium text-willtank-600 hover:text-willtank-700",
            card: "shadow-none",
          }
        }}
      />
      
      <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
        New to WillTank?{" "}
        <Link to="/auth/signup" className="font-bold text-willtank-600 hover:text-willtank-700">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
