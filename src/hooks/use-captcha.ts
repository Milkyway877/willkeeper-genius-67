
import { useRef, useState } from 'react';

export function useCaptcha() {
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const captchaRef = useRef<{ validate: () => boolean }>(null);
  
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
