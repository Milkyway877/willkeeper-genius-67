
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  // Base classes
  const baseClasses = 'font-medium relative inline-flex items-center justify-center rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-willtank-400/50';
  
  // Size classes
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-willtank-500 text-white hover:bg-willtank-600 active:bg-willtank-700 shadow-sm hover:shadow',
    secondary: 'bg-willtank-100 text-willtank-800 hover:bg-willtank-200 active:bg-willtank-300',
    outline: 'border border-willtank-200 bg-transparent text-willtank-700 hover:bg-willtank-50',
    ghost: 'bg-transparent text-willtank-700 hover:bg-willtank-50',
    link: 'bg-transparent text-willtank-500 hover:text-willtank-600 underline-offset-4 hover:underline p-0 h-auto',
  };
  
  // Loading state
  const loadingState = isLoading ? 'opacity-90 pointer-events-none' : '';
  
  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        loadingState,
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {children}
      
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
}
