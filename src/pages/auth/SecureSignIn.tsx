
import React from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import HoneypotField from '@/components/auth/HoneypotField';
import NoPasteWarning from '@/components/auth/NoPasteWarning';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { toast } from '@/hooks/use-toast';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

const SecureSignIn = () => {
  // This function is now simplified to just check the honeypot and show a warning
  // It no longer interferes with the form submission
  const checkHoneypot = () => {
    const honeypotInput = document.querySelector('input[name="user_email_confirmation"]') as HTMLInputElement | null;
    
    if (honeypotInput && honeypotInput.value) {
      // This is likely a bot - silently fail but appear to succeed
      toast({
        title: "Sign in successful",
        description: "Redirecting you to your dashboard...",
        variant: "default",
      });
      
      // Actually do nothing
      return false;
    }
    
    return true;
  };

  return (
    <AuthLayout 
      title="Sign in to WillTank" 
      subtitle="Access your secure will management platform."
      rightPanel={<SecurityInfoPanel mode="signin" />}
    >
      <div className="relative">
        <HoneypotField name="user_email_confirmation" />
        
        <div className="mb-6">
          <NoPasteWarning />
        </div>
        
        <SignInForm />
      </div>
    </AuthLayout>
  );
};

export default SecureSignIn;
