
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm font-medium">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
    </div>
  );
}
