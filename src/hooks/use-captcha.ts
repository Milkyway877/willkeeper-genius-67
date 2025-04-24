
import { useRef } from 'react';
import { CaptchaRef } from '@/components/auth/Captcha';

export const useCaptcha = () => {
  const captchaRef = useRef<CaptchaRef>(null);
  
  const validateCaptcha = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (captchaRef.current) {
        const isValid = captchaRef.current.validate();
        resolve(isValid);
        
        if (!isValid) {
          // Refresh the captcha if validation failed
          captchaRef.current.refresh();
        }
      } else {
        resolve(false);
      }
    });
  };

  // Add this function to handle captcha validation from onValidated prop
  const handleCaptchaValidation = () => {
    // This function can be passed to the Captcha component if needed
    // It's currently just a placeholder to satisfy TypeScript
    return true;
  };
  
  return { captchaRef, validateCaptcha, handleCaptchaValidation };
};
