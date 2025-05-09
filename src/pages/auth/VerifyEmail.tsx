
import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';

export default function VerifyEmail() {
  return (
    <AuthLayout 
      title="Verify Your Email" 
      subtitle="Please verify your email address to continue."
      rightPanel={<VerificationInfoPanel />}
    >
      <SignUp.VerifyEmailView 
        routing="path"
        path="/verify-email"
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
    </AuthLayout>
  );
}
