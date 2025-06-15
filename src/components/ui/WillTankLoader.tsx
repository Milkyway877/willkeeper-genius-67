
import React from 'react';
import { cn } from '@/lib/utils';

export interface WillTankLoaderProps {
  text?: string;
  className?: string;
}

export function WillTankLoader({ text = "Loading...", className }: WillTankLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-screen w-full bg-gradient-to-b from-[#FFF5E6] to-[#e6f0fa] dark:from-gray-900 dark:to-gray-950", className)}>
      <div className="flex flex-col items-center justify-center">
        <img 
          src="/lovable-uploads/6f404753-7188-4c3d-ba16-7d17fbc490b3.png" 
          alt="WillTank Logo Loading"
          className="w-20 h-20 animate-pulse mb-4 drop-shadow-xl"
          draggable={false}
        />
        <span className="text-xl font-bold text-willtank-700 drop-shadow-sm animate-pulse">WillTank</span>
      </div>
      {text && (
        <span className="mt-8 text-base text-gray-600 dark:text-gray-300 tracking-wide animate-fade-in">{text}</span>
      )}
    </div>
  );
}
