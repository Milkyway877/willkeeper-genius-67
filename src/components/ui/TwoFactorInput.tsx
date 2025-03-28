
import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';
import { Button } from './button';
import { ArrowRight } from 'lucide-react';

interface TwoFactorInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
}

export function TwoFactorInput({ onSubmit, loading = false }: TwoFactorInputProps) {
  const [otp, setOtp] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
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
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={otp.length !== 6 || loading}
        >
          {loading ? "Verifying..." : "Verify"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
