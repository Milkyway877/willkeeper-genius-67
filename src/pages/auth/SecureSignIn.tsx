
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SignInForm } from '@/components/auth/SignInForm';
import Captcha from '@/components/auth/Captcha';
import HoneypotField from '@/components/auth/HoneypotField';
import NoPasteWarning from '@/components/auth/NoPasteWarning';
import { useCaptcha } from '@/hooks/use-captcha';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { toast } from '@/hooks/use-toast';
import { SecurityInfoPanel } from '@/components/auth/SecurityInfoPanel';

const SecureSignIn = () => {
  const { isCaptchaValid, handleCaptchaValidation } = useCaptcha();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Check honeypot field
    const formData = new FormData(event.currentTarget);
    const honeypotValue = formData.get('user_email_confirmation');
    
    if (honeypotValue) {
      // This is likely a bot - silently fail but appear to succeed
      toast({
        title: "Sign in successful",
        description: "Redirecting you to your dashboard...",
        variant: "default",
      });
      
      // Actually do nothing
      return;
    }
    
    // Check captcha
    if (!isCaptchaValid) {
      toast({
        title: "Security check required",
        description: "Please complete the captcha verification before signing in.",
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
      title="Sign in to WillTank" 
      subtitle="Access your secure will management platform."
      rightPanel={<SecurityInfoPanel mode="signin" />}
    >
      <div className="relative">
        <HoneypotField name="user_email_confirmation" />
        
        <form onSubmit={onSubmit}>
          {/* Warning message at top of form */}
          <div className="mb-6">
            <NoPasteWarning />
          </div>
          
          <SignInForm />
          
          {/* Captcha before submit button */}
          <div className="mt-6 mb-6">
            <Captcha onValidated={handleCaptchaValidation} />
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SecureSignIn;
