
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import { useEffect } from 'react';

export interface CaptchaRef {
  validate: () => boolean;
  refresh: () => void;
}

interface CaptchaProps {
  onValidated?: () => boolean;
}

const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({ onValidated }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loadCaptchaEnginge(6, '#000000', '#f5f5f5');
  }, []);
  
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (inputRef.current) {
        const isValid = validateCaptcha(inputRef.current.value || '');
        if (isValid && onValidated) {
          onValidated();
        }
        return isValid;
      }
      return false;
    },
    refresh: () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      loadCaptchaEnginge(6, '#000000', '#f5f5f5');
    }
  }));
  
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-2">
        <label className="font-medium text-sm">Security Verification</label>
        <LoadCanvasTemplate />
      </div>
      <input
        ref={inputRef}
        name="captcha"
        placeholder="Enter captcha text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  );
});

Captcha.displayName = 'Captcha';

export default Captcha;
