
import React, { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';
import { Button } from './button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface TwoFactorInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function TwoFactorInput({ onSubmit, loading = false, error }: TwoFactorInputProps) {
  const [otp, setOtp] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      console.log("Submitting 2FA code:", otp);
      onSubmit(otp);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP 
            value={otp} 
            onChange={setOtp} 
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
        
        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
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
