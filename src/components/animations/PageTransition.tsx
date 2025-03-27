
import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div 
      className={cn(
        'animate-fade-in w-full transition-all duration-300 ease-in-out',
        className
      )}
    >
      {children}
    </div>
  );
}
