
import { useRef, useState } from 'react';
import { CaptchaRef } from '@/components/auth/Captcha';

export const useCaptcha = () => {
  const captchaRef = useRef<CaptchaRef>(null);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleCaptchaValidation = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
  };

  return {
    captchaRef,
    isCaptchaValid,
    handleCaptchaValidation
  };
};
