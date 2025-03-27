
import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const getPasswordStrength = (password: string): { strength: number; label: string } => {
    if (!password) return { strength: 0, label: '' };
    
    // Calculate password strength
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character type checks
    if (/[0-9]/.test(password)) strength += 1; // Has numbers
    if (/[a-z]/.test(password)) strength += 1; // Has lowercase
    if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // Has special chars
    
    // Map strength to label
    let label = '';
    if (strength === 0) label = '';
    else if (strength <= 2) label = 'Weak';
    else if (strength <= 4) label = 'Medium';
    else label = 'Strong';
    
    // Normalize strength to 0-3 scale
    strength = Math.min(Math.floor(strength / 2), 3);
    
    return { strength, label };
  };
  
  const { strength, label } = getPasswordStrength(password);
  
  if (!password) return null;
  
  const strengthColors = [
    'bg-red-500',         // Weak (strength 1)
    'bg-yellow-500',      // Medium (strength 2)
    'bg-green-500',       // Strong (strength 3)
  ];
  
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {strength > 0 && (
          <div 
            className={cn(
              "transition-all duration-300",
              strengthColors[strength - 1]
            )} 
            style={{ width: `${(strength / 3) * 100}%` }}
          />
        )}
      </div>
      
      {label && (
        <p className={cn(
          "text-xs",
          strength === 1 ? "text-red-600" : "",
          strength === 2 ? "text-yellow-600" : "",
          strength === 3 ? "text-green-600" : ""
        )}>
          {label} password
        </p>
      )}
    </div>
  );
}
