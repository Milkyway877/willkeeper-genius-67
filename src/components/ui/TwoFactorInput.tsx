
import React, { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';
import { Button } from './button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface TwoFactorInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | null;
  autoSubmit?: boolean;
}

export function TwoFactorInput({ 
  onSubmit, 
  loading = false, 
  error = null,
  autoSubmit = true
}: TwoFactorInputProps) {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Clear local error when external error prop changes
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
      setLocalError("Code must contain only digits");
      return;
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
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
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
    </form>
  );
}
