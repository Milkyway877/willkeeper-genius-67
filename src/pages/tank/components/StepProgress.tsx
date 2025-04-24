
import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export const StepProgress = ({ steps, currentStep }: StepProgressProps) => {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="mt-6">
      <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
        <div 
          className="bg-willtank-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="mt-6 flex overflow-x-auto pb-4 hide-scrollbar">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex-shrink-0 ${index !== steps.length - 1 ? 'mr-6' : ''}`}
          >
            <div className="flex items-center">
              <div 
                className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                  index < currentStep 
                    ? 'bg-willtank-100 text-willtank-700' 
                    : index === currentStep 
                      ? 'bg-willtank-500 text-white' 
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div>
                <p className={`font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
