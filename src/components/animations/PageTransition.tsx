
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
        'animate-fade-in w-full transition-all duration-500 ease-in-out', 
        'transform-gpu motion-reduce:transform-none motion-reduce:transition-none',
        className
      )}
    >
      {children}
    </div>
  );
}
