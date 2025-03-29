
import { useState } from 'react';

export function useCaptcha() {
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  
  const handleCaptchaValidation = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
  };
  
  return { isCaptchaValid, handleCaptchaValidation };
}
