
import React from 'react';
import { RecoverForm } from '@/components/auth/RecoverForm';
import Captcha from '@/components/auth/Captcha';
import HoneypotField from '@/components/auth/HoneypotField';
import NoPasteWarning from '@/components/auth/NoPasteWarning';
import { useCaptcha } from '@/hooks/use-captcha';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { toast } from '@/hooks/use-toast';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

const SecureRecover = () => {
  const { isCaptchaValid, handleCaptchaValidation } = useCaptcha();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Check honeypot field
    const formData = new FormData(event.currentTarget);
    const honeypotValue = formData.get('user_email_confirmation');
    
    if (honeypotValue) {
      // This is likely a bot - silently fail but appear to succeed
      toast({
        title: "Recovery email sent",
        description: "If an account exists with this email, you'll receive instructions to reset your password.",
        variant: "default",
      });
      
      // Actually do nothing
      return;
    }
    
    // Check captcha
    if (!isCaptchaValid) {
      toast({
        title: "Security check required",
        description: "Please complete the captcha verification first.",
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
      title="Recover your account" 
      subtitle="Enter your email to reset your password."
      rightPanel={<SecurityInfoPanel mode="recover" />}
    >
      <div className="relative">
        <HoneypotField name="user_email_confirmation" />
        
        <form onSubmit={onSubmit}>
          {/* Warning message at top of form */}
          <div className="mb-6">
            <NoPasteWarning />
          </div>
          
          <RecoverForm />
          
          {/* Captcha before submit button */}
          <div className="mt-6 mb-6">
            <Captcha onValidated={handleCaptchaValidation} />
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SecureRecover;
