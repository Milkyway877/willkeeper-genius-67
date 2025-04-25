
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useNavigate } from 'react-router-dom';

export default function AccountActivation() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Account Activation">
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            Account activation is currently unavailable.
          </p>
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </AuthLayout>
  );
}
