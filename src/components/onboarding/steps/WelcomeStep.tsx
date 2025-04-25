
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to WillTank</h2>
        <p className="text-white/80 mb-6">
          Let's get you started on securing your digital legacy. We'll guide you through a few quick steps to personalize your experience.
        </p>
      </motion.div>

      <Button 
        onClick={onNext}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6"
      >
        Begin Journey <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}
