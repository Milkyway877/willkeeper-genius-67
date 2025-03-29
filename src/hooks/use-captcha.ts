
import { useRef, useState } from 'react';
import { CaptchaRef } from '@/components/auth/Captcha';

export function useCaptcha() {
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const captchaRef = useRef<CaptchaRef>(null);
  
  const handleCaptchaValidation = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
  };
  
  const validateCaptcha = (): boolean => {
    if (captchaRef.current) {
      return captchaRef.current.validate();
    }
    return false;
  };
  
  return { 
    isCaptchaValid, 
    handleCaptchaValidation, 
    captchaRef,
    validateCaptcha
  };
}
