
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CompletionStepProps {
  onComplete: () => void;
}

export function CompletionStep({ onComplete }: CompletionStepProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">You're All Set!</h2>
        <p className="text-white/80 mb-6">
          Thank you for completing the onboarding process. Your journey with WillTank begins now.
        </p>
      </motion.div>

      <Button 
        onClick={onComplete}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6"
      >
        Go to Dashboard <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}
