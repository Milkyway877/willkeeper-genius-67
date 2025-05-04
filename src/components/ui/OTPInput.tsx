
import React, { useState, useEffect, useRef } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';
import { Button } from './button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface OTPInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | null;
  autoSubmit?: boolean;
  useFormElement?: boolean;
}

export function OTPInput({ 
  onSubmit, 
  loading = false, 
  error = null,
  autoSubmit = true,
  useFormElement = true
}: OTPInputProps) {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Clear local error when external error prop changes or reset when the error is fixed
  useEffect(() => {
    setLocalError(error);
  }, [error]);
  
  // Focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      console.log("Manually submitting OTP code:", otp);
      onSubmit(otp);
    } else {
      setLocalError("Please enter a 6-digit code");
    }
  };
  
  const handleChange = (value: string) => {
    // Clear error when user starts typing
    if (localError) setLocalError(null);
    
    // Ensure only digits are entered
    if (value && !/^\d*$/.test(value)) {
      return; // Don't update if non-digits are entered
    }
    
    setOtp(value);
    
    // Auto-submit when code is complete (if enabled)
    if (autoSubmit && value.length === 6) {
      console.log("Auto-submitting OTP code:", value);
      onSubmit(value);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter key
    if (e.key === 'Enter' && otp.length === 6) {
      e.preventDefault();
      onSubmit(otp);
    }
  };
  
  const Content = () => (
    <div className="space-y-4">
      <div className="flex justify-center">
        <InputOTP 
          value={otp} 
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={6}
          disabled={loading}
          autoFocus
          pattern="\d{1}"
          inputMode="numeric"
          ref={inputRef}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      {localError && (
        <div className="text-sm text-red-500 text-center" role="alert">{localError}</div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={otp.length !== 6 || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
          </>
        ) : (
          <>
            Verify <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
  
  // Use either a form or a div based on the prop
  return useFormElement ? (
    <form onSubmit={handleSubmit}>
      <Content />
    </form>
  ) : (
    <div onClick={(e) => {
      // Only call handleSubmit for button clicks
      if ((e.target as HTMLElement).tagName === 'BUTTON') {
        handleSubmit(e);
      }
    }}>
      <Content />
    </div>
  );
}

// For backward compatibility
export const TwoFactorInput = OTPInput;
