
import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string | null;
}

export function OTPInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  error = null,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0] && !disabled && value.length === 0) {
      inputRefs.current[0].focus();
    }
  }, [disabled, value]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Allow only one digit per input
    if (inputValue && !/^\d$/.test(inputValue)) {
      return;
    }

    const newValue = value.split('');
    newValue[index] = inputValue;
    const updatedValue = newValue.join('');
    onChange(updatedValue);

    // Move to next input if current one is filled
    if (inputValue !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all inputs are filled
    if (updatedValue.length === length && !updatedValue.includes('') && onComplete) {
      onComplete(updatedValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, length);
    
    if (/^\d+$/.test(pastedData)) {
      // Update the value
      onChange(pastedData.padEnd(length, '').substring(0, length));
      
      // Focus the appropriate input
      const lastFilledIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
      
      // Call onComplete if all inputs are filled
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center space-x-2">
        {Array.from({ length }).map((_, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="w-12 h-14 text-center text-lg font-semibold"
            value={value[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            ref={(el) => (inputRefs.current[index] = el)}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of verification code`}
            autoComplete="one-time-code"
          />
        ))}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
