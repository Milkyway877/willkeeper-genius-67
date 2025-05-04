
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { TwoFactorAuthForm } from '@/components/auth/TwoFactorAuthForm';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function TwoFactorAuthentication() {
  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle="Please enter the code from your authenticator app"
      rightPanel={<SecurityInfoPanel mode="verification" />}
    >
      <TwoFactorAuthForm />
    </AuthLayout>
  );
}
