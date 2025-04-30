
import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number | { sm?: number; md?: number; lg?: number };
  gap?: number;
  children: React.ReactNode;
}

export function Grid({ 
  cols = 1, 
  gap = 4, 
  className, 
  children, 
  ...props 
}: GridProps) {
  // Handle responsive column layouts
  const colClasses = React.useMemo(() => {
    if (typeof cols === 'number') {
      return `grid-cols-1 md:grid-cols-${cols}`;
    }
    
    return cn(
      'grid-cols-1',
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`
    );
  }, [cols]);
  
  return (
    <div 
      className={cn(
        'grid',
        colClasses,
        `gap-${gap}`,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function GridItem({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
