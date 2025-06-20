
import { useState } from 'react';

export const useCaptcha = () => {
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleCaptchaValidation = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
    return isValid;
  };

  const validateCaptcha = (): boolean => {
    // Return the current captcha validation state
    return isCaptchaValid;
  };

  return {
    isCaptchaValid,
    handleCaptchaValidation,
    validateCaptcha
  };
};
