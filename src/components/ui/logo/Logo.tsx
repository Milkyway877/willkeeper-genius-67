
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'black';
  className?: string;
  showSlogan?: boolean;
}

export function Logo({ size = 'md', color = 'primary', className, showSlogan = true }: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-8';
      case 'lg': return 'h-12';
      case 'md':
      default: return 'h-10';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white': return 'text-white';
      case 'black': return 'text-foreground';
      case 'primary':
      default: return 'text-blue-600';
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className={cn('flex items-center gap-2 font-bold', getSizeClasses(), getColorClasses())}>
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-soft blur-sm bg-blue-500 rounded-full"></div>
          <svg
            className="relative"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" fill="#F8D16F" />
            <path 
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C14 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" 
              fill="#0284c7"
            />
          </svg>
        </div>
        <span className="tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">WillTank</span>
      </div>
      {showSlogan && (
        <span className="text-xs text-gray-500 italic ml-7 -mt-1">Your Trusted Legacy Keeper</span>
      )}
    </div>
  );
}
