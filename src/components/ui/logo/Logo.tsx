
import React from 'react';
import { cn } from '@/lib/utils';
import { DotPatternText } from '@/components/ui/DotPatternText';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'black';
  className?: string;
  showSlogan?: boolean;
  pixelated?: boolean;
}

export function Logo({ size = 'md', color = 'primary', className, showSlogan = true, pixelated = false }: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-9';
      case 'lg': return 'h-14';
      case 'md':
      default: return 'h-12';
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
    <div className={cn('flex items-center', className)}>
      <div className={cn('flex items-center gap-2', getSizeClasses(), getColorClasses())}>
        <img 
          src="/lovable-uploads/6f404753-7188-4c3d-ba16-7d17fbc490b3.png" 
          alt="WillTank Logo" 
          className={cn('h-full w-auto object-contain')}
        />
        <span className="tracking-tight font-bold text-xl md:text-2xl">WillTank</span>
      </div>
      {showSlogan && (
        <span className="text-xs text-gray-500 italic ml-2">Your Trusted Legacy Keeper</span>
      )}
    </div>
  );
}
