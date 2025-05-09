
import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function ClerkSignUp() {
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
        afterSignUpUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none p-0",
            header: "hidden",
            footer: "hidden"
          }
        }}
      />
    </AuthLayout>
  );
}
