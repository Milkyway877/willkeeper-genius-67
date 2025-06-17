
import { useState } from 'react';

export const useCaptcha = () => {
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleCaptchaValidation = (isValid: boolean) => {
    setIsCaptchaValid(isValid);
  };

  const validateCaptcha = (): boolean => {
    return isCaptchaValid;
  };

  const resetCaptcha = () => {
    setIsCaptchaValid(false);
  };

  return {
    isCaptchaValid,
    handleCaptchaValidation,
    validateCaptcha,
    resetCaptcha
  };
};
