
import React, { ReactNode } from 'react';
import { Logo } from '@/components/ui/logo/Logo';
import { motion } from 'framer-motion';

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
}

export function OnboardingLayout({ children, step, totalSteps }: OnboardingLayoutProps) {
  // Calculate background color based on step (getting lighter)
  const getBackgroundColor = (currentStep: number) => {
    const baseHue = 210; // Blue hue
    const lightness = 15 + (currentStep - 1) * 5; // Gets lighter with each step
    return `hsl(${baseHue}, 50%, ${lightness}%)`;
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-500"
      style={{ backgroundColor: getBackgroundColor(step) }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Logo size="lg" color="white" className="mx-auto" showSlogan />
        </motion.div>

        {/* Progress indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index + 1 <= step
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {index + 1 <= step ? '✓' : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div 
                    className={`flex-1 h-0.5 mx-2 ${
                      index + 1 < step ? 'bg-blue-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-white/70 text-sm">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
