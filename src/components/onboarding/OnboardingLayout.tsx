
import React, { ReactNode } from 'react';
import { Logo } from '@/components/ui/logo/Logo';
import { motion } from 'framer-motion';

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
}

export function OnboardingLayout({ children, step, totalSteps }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gray-950 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {index + 1 <= step ? '✓' : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div 
                    className={`flex-1 h-0.5 mx-2 ${
                      index + 1 < step ? 'bg-blue-600' : 'bg-gray-800'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Content */}
        <motion.div 
          className="max-w-md mx-auto w-full flex-1 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl">
            {children}
          </div>
        </motion.div>
        
        <div className="h-16" /> {/* Bottom spacing */}
      </div>
      
      {/* Background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-dot-pattern opacity-5" />
      </div>
    </div>
  );
}
