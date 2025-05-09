
import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function ClerkResetPassword() {
  return (
    <AuthLayout 
      title="Reset your password" 
      subtitle="Enter a new secure password for your account."
      rightPanel={<SecurityInfoPanel mode="recover" />}
    >
      <SignIn 
        routing="path" 
        path="/auth/reset-password"
        signUpUrl="/auth/signup"
        afterSignInUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none p-0",
            header: "hidden",
            footer: "hidden",
            formButtonPrimary: "bg-black hover:bg-gray-800",
            form: "gap-6"
          }
        }}
      />
    </AuthLayout>
  );
}
