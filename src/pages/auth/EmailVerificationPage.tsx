
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { EmailVerificationForm } from '@/components/auth/EmailVerificationForm';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';

export default function EmailVerificationPage() {
  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Verify your email address to activate your account"
      rightPanel={<VerificationInfoPanel />}
    >
      <EmailVerificationForm />
    </AuthLayout>
  );
}
