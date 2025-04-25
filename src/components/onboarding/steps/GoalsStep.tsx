
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface GoalItem {
  id: number;
  title: string;
  description: string;
  key: "digitalWill" | "legacyPlanning" | "messageVault";
}

interface UserGoals {
  digitalWill: boolean;
  legacyPlanning: boolean;
  messageVault: boolean;
}

interface GoalsStepProps {
  onNext: () => void;
  onGoalSelection: (goals: UserGoals) => void;
  selectedGoals: UserGoals;
}

export function GoalsStep({ onNext, onGoalSelection, selectedGoals }: GoalsStepProps) {
  const goals: GoalItem[] = [
    { 
      id: 1, 
      title: "Digital Will Creation", 
      description: "Secure your digital assets and ensure they're passed on according to your wishes",
      key: "digitalWill"
    },
    { 
      id: 2, 
      title: "Legacy Planning", 
      description: "Create a comprehensive plan for future generations to access your digital legacy",
      key: "legacyPlanning"
    },
    { 
      id: 3, 
      title: "Message Vault", 
      description: "Store important messages to be delivered to loved ones in the future",
      key: "messageVault"
    },
  ];

  const toggleGoal = (key: "digitalWill" | "legacyPlanning" | "messageVault") => {
    const updatedGoals = {
      ...selectedGoals,
      [key]: !selectedGoals[key]
    };
    onGoalSelection(updatedGoals);
  };

  const handleContinue = () => {
    // If no goals are selected, select the first one by default
    if (!selectedGoals.digitalWill && !selectedGoals.legacyPlanning && !selectedGoals.messageVault) {
      onGoalSelection({
        ...selectedGoals,
        digitalWill: true
      });
    }
    onNext();
  };

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
            className={`p-4 rounded-lg ${
              selectedGoals[goal.key] 
                ? 'bg-blue-500/30 border-blue-400' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            } border cursor-pointer transition-all`}
            onClick={() => toggleGoal(goal.key)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="font-medium text-white">{goal.title}</h3>
                <p className="text-sm text-white/70">{goal.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border ${
                selectedGoals[goal.key] 
                  ? 'border-blue-400 bg-blue-500' 
                  : 'border-white/30'
              } flex items-center justify-center`}>
                {selectedGoals[goal.key] && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Button 
        onClick={handleContinue}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4 py-6"
      >
        Continue <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}
