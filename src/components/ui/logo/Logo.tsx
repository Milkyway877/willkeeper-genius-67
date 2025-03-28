
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
          <img 
            src="/lovable-uploads/8cb71a6a-5431-4559-b391-2dde0ad34da9.png" 
            alt="WillTank Logo" 
            className="relative h-full w-auto"
          />
        </div>
        <span className="tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">WillTank</span>
      </div>
      {showSlogan && (
        <span className="text-xs text-gray-500 italic ml-7 -mt-1">Your Trusted Legacy Keeper</span>
      )}
    </div>
  );
}
