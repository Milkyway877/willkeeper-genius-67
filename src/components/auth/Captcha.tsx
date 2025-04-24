
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import { useEffect } from 'react';

export interface CaptchaRef {
  validate: () => boolean;
  refresh: () => void;
}

const Captcha = forwardRef<CaptchaRef>((_, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loadCaptchaEnginge(6, '#000000', '#f5f5f5');
  }, []);
  
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (inputRef.current) {
        return validateCaptcha(inputRef.current.value || '');
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
