
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface GoalsStepProps {
  onNext: () => void;
}

export function GoalsStep({ onNext }: GoalsStepProps) {
  const goals = [
    { id: 1, title: "Digital Will Creation", description: "Secure your digital assets" },
    { id: 2, title: "Legacy Planning", description: "Plan for future generations" },
    { id: 3, title: "Message Vault", description: "Store important messages" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">What brings you here?</h2>
        <p className="text-white/80">Select your primary goals with WillTank</p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: goal.id * 0.1 }}
            className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all"
          >
            <h3 className="font-medium text-white">{goal.title}</h3>
            <p className="text-sm text-white/70">{goal.description}</p>
          </motion.div>
        ))}
      </div>

      <Button 
        onClick={onNext}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4 py-6"
      >
        Continue <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}
