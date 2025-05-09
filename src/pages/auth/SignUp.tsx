
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUp } from "@clerk/clerk-react";
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function SignUpPage() {
  return (
    <AuthLayout 
      title="Create your WillTank account" 
      subtitle="Join our secure platform and start protecting your legacy with bank-grade encryption."
      rightPanel={<SecurityInfoPanel mode="signup" />}
    >
      <SignUp 
        routing="path" 
        path="/auth/signup" 
        signInUrl="/auth/signin"
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
        Already have an account?{" "}
        <Link to="/auth/signin" className="font-bold text-willtank-600 hover:text-willtank-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
