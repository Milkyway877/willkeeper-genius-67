
import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function ClerkSignIn() {
  return (
    <AuthLayout 
      title="Sign in to WillTank" 
      subtitle="Access your secure will management platform."
      rightPanel={<SecurityInfoPanel mode="signin" />}
    >
      <SignIn 
        routing="path" 
        path="/auth/signin"
        signUpUrl="/auth/signup"
        afterSignInUrl="/dashboard"
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
