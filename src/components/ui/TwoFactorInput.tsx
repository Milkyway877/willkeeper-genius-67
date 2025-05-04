
import React, { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';
import { Button } from './button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface TwoFactorInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | null;
  autoSubmit?: boolean;
  useFormElement?: boolean; // Controls whether to use form or div
}

export function TwoFactorInput({ 
  onSubmit, 
  loading = false, 
  error = null,
  autoSubmit = true,
  useFormElement = true // Default to using form element for backward compatibility
}: TwoFactorInputProps) {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Clear local error when external error prop changes or reset when the error is fixed
  useEffect(() => {
    setLocalError(error);
  }, [error]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      console.log("Manually submitting 2FA code:", otp);
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
      console.log("Auto-submitting 2FA code:", value);
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
          // Add these properties to enable auto-focus behavior
          autoFocus
          pattern="\d{1}"
          inputMode="numeric"
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
