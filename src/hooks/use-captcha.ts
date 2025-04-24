
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
  
  return { captchaRef, validateCaptcha };
};
