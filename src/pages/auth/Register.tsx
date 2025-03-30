
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { VerificationInfoPanel } from '@/components/auth/VerificationInfoPanel';
import { SignUpForm } from '@/components/auth/SignUpForm';

const Register: React.FC = () => {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Sign up to access our secure will management platform"
      rightPanel={<VerificationInfoPanel />}
    >
      <SignUpForm />
    </AuthLayout>
  );
};

export default Register;
