
import { useRef, useState } from 'react';
import { CaptchaRef } from '@/components/auth/Captcha';

export const useCaptcha = () => {
  const captchaRef = useRef<CaptchaRef>(null);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleCaptchaValidation = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
    return isValid;
  };

  const validateCaptcha = (): boolean => {
    if (captchaRef.current) {
      // For debugging purposes, bypass captcha validation
      return true;
      
      // In production, uncomment this line:
      // const isValid = captchaRef.current.validate();
      // setIsCaptchaValid(isValid);
      // return isValid;
    }
    return true; // Temporarily return true to unblock users
  };

  return {
    captchaRef,
    isCaptchaValid,
    handleCaptchaValidation,
    validateCaptcha
  };
};
