
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [code, setCode] = React.useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length === 6) {
      onSubmit(code);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(input);
    
    if (autoSubmit && input.length === 6) {
      onSubmit(input);
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input 
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={handleChange}
          placeholder="Enter 6-digit code"
          className="text-center font-mono"
          disabled={loading}
        />
        <Button type="submit" disabled={code.length !== 6 || loading}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
