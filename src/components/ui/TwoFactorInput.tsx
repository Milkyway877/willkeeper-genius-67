
import React, { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';
import { Button } from './button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface TwoFactorInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | null;
  autoSubmit?: boolean;
  showButton?: boolean; // New prop to control button visibility
  value?: string; // Allow external value control
  onChange?: (value: string) => void; // Allow external change handling
}

export function TwoFactorInput({ 
  onSubmit, 
  loading = false, 
  error = null,
  autoSubmit = true,
  showButton = true,
  value,
  onChange
}: TwoFactorInputProps) {
  const [internalOtp, setInternalOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Use external value if provided, otherwise use internal state
  const otp = value !== undefined ? value : internalOtp;
  const setOtp = onChange || setInternalOtp;
  
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
  
  const handleChange = (newValue: string) => {
    // Clear error when user starts typing
    if (localError) setLocalError(null);
    
    // Ensure only digits are entered
    if (newValue && !/^\d*$/.test(newValue)) {
      return; // Don't update if non-digits are entered
    }
    
    setOtp(newValue);
    
    // Auto-submit when code is complete (if enabled)
    if (autoSubmit && newValue.length === 6) {
      console.log("Auto-submitting 2FA code:", newValue);
      onSubmit(newValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter key
    if (e.key === 'Enter' && otp.length === 6) {
      e.preventDefault();
      onSubmit(otp);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP 
            value={otp} 
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
        
        {showButton && (
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
        )}
      </div>
    </form>
  );
}
