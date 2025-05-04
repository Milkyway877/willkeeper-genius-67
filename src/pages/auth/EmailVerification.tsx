
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { EmailVerificationForm } from '@/components/auth/EmailVerificationForm';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';

export default function EmailVerification() {
  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Please enter the verification code sent to your email"
      rightPanel={<VerificationInfoPanel />}
    >
      <EmailVerificationForm />
    </AuthLayout>
  );
}
