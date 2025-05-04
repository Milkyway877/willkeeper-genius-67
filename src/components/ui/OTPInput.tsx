
import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

interface OTPInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  autoSubmit?: boolean;
  error?: string | null;
}

export const OTPInput = ({
  onSubmit,
  loading = false,
  autoSubmit = true,
  error = null,
}: OTPInputProps) => {
  const [code, setCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const handleInputChange = (index: number, value: string) => {
    // Allow only one digit per input
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = code.split('');
    newCode[index] = value;
    const updatedCode = newCode.join('');
    setCode(updatedCode);

    // Move to next input if current one is filled
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits are entered and autoSubmit is true
    if (updatedCode.length === 6 && !updatedCode.includes('') && autoSubmit) {
      onSubmit(updatedCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    if (code.length === 6) {
      onSubmit(code);
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.padEnd(6, '').split('');
      setCode(newCode.join(''));
      newCode.forEach((digit, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = digit;
        }
      });
      
      // Focus the last input with a value
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
      
      if (pastedData.length === 6 && autoSubmit) {
        onSubmit(pastedData);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        {Array(6).fill(0).map((_, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="w-12 h-12 text-center text-lg font-bold"
            value={code[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            ref={(el) => (inputRefs.current[index] = el)}
            disabled={loading}
            aria-label={`Verification code digit ${index + 1}`}
          />
        ))}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!autoSubmit && (
        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit} 
            disabled={code.length !== 6 || loading} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
