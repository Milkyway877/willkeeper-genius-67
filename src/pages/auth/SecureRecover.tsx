
import React from 'react';
import { RecoverForm } from '@/components/auth/RecoverForm';
import HoneypotField from '@/components/auth/HoneypotField';
import NoPasteWarning from '@/components/auth/NoPasteWarning';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const SecureRecover = () => {
  return (
    <AuthLayout 
      title="Recover your account" 
      subtitle="Enter your email to reset your password."
      rightPanel={<SecurityInfoPanel mode="recover" />}
    >
      <div className="relative">
        <HoneypotField name="user_email_confirmation" />
        
        <Card className="border-none shadow-none">
          <CardHeader className="space-y-1 p-0">
            <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
            <CardDescription>
              Enter your email to receive reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="mb-6">
              <NoPasteWarning />
            </div>
            <RecoverForm />
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default SecureRecover;
