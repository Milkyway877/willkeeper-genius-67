
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
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  pixelated?: boolean;
  fontSize?: string;
}

export function DotPatternText({
  children,
  className,
  dotColor = 'black',
  dotSize = 2,
  dotSpacing = 10,
  animate = false,
  weight = 'bold',
  pixelated = false,
  fontSize = 'inherit'
}: DotPatternTextProps) {
  const style = {
    backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
    backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    animation: animate ? 'dotPatternMove 20s linear infinite' : 'none',
    fontSize,
    fontFamily: pixelated ? "'Press Start 2P', monospace, system-ui" : 'inherit',
    letterSpacing: pixelated ? '0.05em' : 'inherit',
  };

  const fontWeightClass = {
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold',
    'extrabold': 'font-extrabold',
  }[weight];

  return (
    <motion.span
      className={cn("inline-block", fontWeightClass, className)}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.span>
  );
}
