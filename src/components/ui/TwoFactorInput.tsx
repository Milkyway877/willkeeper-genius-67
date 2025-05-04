
import React, { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';
import { Button } from './button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface VerificationCodeInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | null;
  autoSubmit?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export function TwoFactorInput({ 
  onSubmit, 
  loading = false, 
  error = null,
  autoSubmit = false, // Changed default to false to prevent premature submissions
  value: externalValue,
  onChange: externalOnChange
}: VerificationCodeInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const value = externalValue !== undefined ? externalValue : internalValue;
  
  // Clear local error when external error prop changes or reset when the error is fixed
  useEffect(() => {
    setLocalError(error);
  }, [error]);
  
  const handleSubmitAction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (value.length === 6) {
      console.log("Submitting verification code:", value);
      onSubmit(value);
    } else {
      setLocalError("Please enter a 6-digit code");
    }
  };
  
  const handleChange = (newValue: string) => {
    // Clear error when user starts typing
    if (localError) setLocalError(null);
    
    // Ensure only digits are entered
    if (newValue && !/^\d*$/.test(newValue)) {
      return; // Don't update if non-digits are entered
    }
    
    if (externalOnChange) {
      externalOnChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    
    // Auto-submit when code is complete (if enabled)
    if (autoSubmit && newValue.length === 6) {
      console.log("Auto-submitting verification code:", newValue);
      onSubmit(newValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter key
    if (e.key === 'Enter' && value.length === 6) {
      e.preventDefault();
      onSubmit(value);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <InputOTP 
          value={value} 
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={6}
          disabled={loading}
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
        type="button" 
        className="w-full" 
        disabled={value.length !== 6 || loading}
        onClick={() => handleSubmitAction()}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
          </>
        ) : (
          <>
            Verify Email <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
