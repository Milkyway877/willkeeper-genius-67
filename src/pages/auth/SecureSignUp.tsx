
import React from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm';
import HoneypotField from '@/components/auth/HoneypotField';
import NoPasteWarning from '@/components/auth/NoPasteWarning';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { toast } from '@/hooks/use-toast';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

const SecureSignUp = () => {
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Check honeypot field
    const formData = new FormData(event.currentTarget);
    const honeypotValue = formData.get('user_email_confirmation');
    
    if (honeypotValue) {
      // This is likely a bot - silently fail but appear to succeed
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
        variant: "default",
      });
      
      // Actually do nothing
      return;
    }
    
    // Let the original form submit handler take over
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) {
      (submitButton as HTMLButtonElement).click();
    }
  };

  return (
    <AuthLayout 
      title="Create your WillTank account" 
      subtitle="Join our secure platform and start protecting your legacy with bank-grade encryption."
      rightPanel={<SecurityInfoPanel mode="signup" />}
    >
      <div className="relative">
        <HoneypotField name="user_email_confirmation" />
        
        <form onSubmit={onSubmit}>
          {/* Warning message at top of form */}
          <div className="mb-6">
            <NoPasteWarning />
          </div>
          
          <SignUpForm />
        </form>
      </div>
    </AuthLayout>
  );
};

export default SecureSignUp;
