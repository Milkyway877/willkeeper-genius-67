
import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function ClerkRecover() {
  return (
    <AuthLayout 
      title="Recover your account" 
      subtitle="Enter your email to reset your password."
      rightPanel={<SecurityInfoPanel mode="recover" />}
    >
      <SignIn 
        routing="path" 
        path="/auth/forgot-password"
        signUpUrl="/auth/signup"
        afterSignInUrl="/dashboard"
        initialValues={{ 
          emailAddress: '' 
        }}
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
