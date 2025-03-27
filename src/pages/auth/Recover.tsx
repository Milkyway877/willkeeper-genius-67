
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RecoverForm } from '@/components/auth/RecoverForm';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

export default function Recover() {
  return (
    <AuthLayout 
      title="Recover your TanKey" 
      subtitle="Enter your email and PIN to recover access."
      rightPanel={<SecurityInfoPanel mode="recover" />}
    >
      <RecoverForm />
      
      <p className="text-center text-sm text-muted-foreground mt-6">
        Remembered your TanKey?{" "}
        <Link to="/auth/signin" className="font-medium text-willtank-600 hover:text-willtank-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
