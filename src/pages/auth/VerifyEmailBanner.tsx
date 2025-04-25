
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';

export default function VerifyEmailBanner() {
  return (
    <AuthLayout
      title="Email Verification Required"
      subtitle="Please verify your email to continue"
      rightPanel={<VerificationInfoPanel />}
    >
      <EmailVerificationBanner />
    </AuthLayout>
  );
}
