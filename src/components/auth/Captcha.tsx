
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export interface CaptchaProps {
  onValidated: (isValid: boolean) => void;
}

export interface CaptchaRef {
  validate: () => boolean;
}

const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({ onValidated }, ref) => {
  const [userCaptcha, setUserCaptcha] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [attemptedValidation, setAttemptedValidation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  // This function will be called by the parent component when submitting
  const validateUserCaptcha = (): boolean => {
    setAttemptedValidation(true);
    const valid = validateCaptcha(userCaptcha);
    setIsValid(valid);
    onValidated(valid);
    
    // Refresh captcha if incorrect
    if (!valid) {
      loadCaptchaEnginge(6);
      setUserCaptcha('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    
    return valid;
  };

  const refreshCaptcha = () => {
    loadCaptchaEnginge(6);
    setUserCaptcha('');
    setAttemptedValidation(false);
    setIsValid(false);
    onValidated(false);
  };

  // Expose the validation method to the parent component
  useImperativeHandle(ref, () => ({
    validate: validateUserCaptcha
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Security Check</div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={refreshCaptcha}
          className="p-0 h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh Captcha</span>
        </Button>
      </div>
      
      <div className="border rounded-md p-2 bg-gray-50">
        <LoadCanvasTemplate />
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-col space-y-1.5">
          <input
            ref={inputRef}
            type="text"
            value={userCaptcha}
            onChange={(e) => setUserCaptcha(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter the code above"
            onPaste={(e) => e.preventDefault()}
          />
          {attemptedValidation && !isValid && (
            <p className="text-sm text-red-500">Invalid captcha. Please try again.</p>
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        For security reasons, please manually type the code above. Copy-paste is disabled.
      </div>
    </div>
  );
});

Captcha.displayName = 'Captcha';

export default Captcha;
