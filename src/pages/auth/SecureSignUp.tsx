
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
    
    // Find the inner form component and access its submit handler directly
    const signUpFormElement = event.currentTarget.querySelector('form');
    
    if (signUpFormElement) {
      signUpFormElement.dispatchEvent(new Event('submit', { 
        bubbles: true, 
        cancelable: true 
      }));
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
        
        <form onSubmit={onSubmit} className="space-y-6">
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
