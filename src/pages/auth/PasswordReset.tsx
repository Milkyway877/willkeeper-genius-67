
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RecoverForm } from '@/components/auth/RecoverForm';

const PasswordReset: React.FC = () => {
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email and we'll send you instructions to reset your password"
    >
      <RecoverForm />
    </AuthLayout>
  );
};

export default PasswordReset;
