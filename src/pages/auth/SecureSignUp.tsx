
import React from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm';
import Captcha from '@/components/auth/Captcha';
import HoneypotField from '@/components/auth/HoneypotField';
import NoPasteWarning from '@/components/auth/NoPasteWarning';
import { useCaptcha } from '@/hooks/use-captcha';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { toast } from '@/hooks/use-toast';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

const SecureSignUp = () => {
  const { isCaptchaValid, handleCaptchaValidation } = useCaptcha();

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
    
    // Check captcha
    if (!isCaptchaValid) {
      toast({
        title: "Security check required",
        description: "Please complete the captcha verification before creating your account.",
        variant: "destructive",
      });
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
          <SignUpForm />
          
          <div className="mt-6">
            <NoPasteWarning />
          </div>
          
          <div className="my-6">
            <Captcha onValidated={handleCaptchaValidation} />
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SecureSignUp;
