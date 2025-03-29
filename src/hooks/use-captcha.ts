
import { useRef, useState } from 'react';
import { CaptchaRef } from '@/components/auth/Captcha';

export const useCaptcha = () => {
  const captchaRef = useRef<CaptchaRef>(null);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleCaptchaValidation = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
  };

  const validateCaptcha = (): boolean => {
    if (captchaRef.current) {
      const isValid = captchaRef.current.validate();
      setIsCaptchaValid(isValid);
      return isValid;
    }
    return false;
  };

  return {
    captchaRef,
    isCaptchaValid,
    handleCaptchaValidation,
    validateCaptcha
  };
};
