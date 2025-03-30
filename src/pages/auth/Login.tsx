
import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';
import { SignInForm } from '@/components/auth/SignInForm';

const Login: React.FC = () => {
  return (
    <AuthLayout
      title="Login to Your Account"
      subtitle="Enter your email and password to access your dashboard"
      rightPanel={<SecurityInfoPanel />}
    >
      <SignInForm />
    </AuthLayout>
  );
};

export default Login;
