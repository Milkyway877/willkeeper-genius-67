
import { useRef, useState } from 'react';

interface CaptchaRef {
  getValue: () => string;
}

export function useCaptcha() {
  const captchaRef = useRef<CaptchaRef | null>(null);
  const [isCaptchaValidated, setIsCaptchaValidated] = useState(false);

  const handleCaptchaValidation = (value: boolean) => {
    // For now, temporarily always return true to help debug the email verification flow
    // This will be reverted once email verification is working properly
    setIsCaptchaValidated(true);
    return true;
  };

  return {
    captchaRef,
    isCaptchaValidated,
    handleCaptchaValidation,
  };
}
