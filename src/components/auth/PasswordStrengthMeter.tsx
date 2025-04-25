
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Return a score from 0-4
    return Math.min(Math.floor(score / 1.5), 4);
  }, [password]);
  
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = [
    '', 
    'bg-red-500', 
    'bg-yellow-500', 
    'bg-green-500', 
    'bg-green-600'
  ];
  
  if (!password) return null;
  
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level}
            className={cn(
              "h-full w-1/4 transition-all duration-300 ease-in-out",
              level <= strength ? strengthColors[strength] : "bg-transparent"
            )}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={cn(
          "text-xs font-medium",
          strength === 1 ? "text-red-500" : 
          strength === 2 ? "text-yellow-500" : 
          "text-green-600"
        )}>
          {strengthLabels[strength]}
        </p>
      )}
    </div>
  );
}
