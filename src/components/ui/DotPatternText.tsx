
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DotPatternTextProps {
  children: React.ReactNode;
  className?: string;
  dotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  animate?: boolean;
}

export function DotPatternText({
  children,
  className,
  dotColor = 'black',
  dotSize = 2,
  dotSpacing = 10,
  animate = true
}: DotPatternTextProps) {
  const style = {
    backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
    backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    animation: animate ? 'dotPatternMove 20s linear infinite' : 'none'
  };

  return (
    <motion.span
      className={cn("inline-block font-bold", className)}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.span>
  );
}
