
import { Check } from 'lucide-react';
import { steps } from '../config/wizardSteps';

interface WillWizardStepsProps {
  currentStep: number;
}

export const WillWizardSteps = ({ currentStep }: WillWizardStepsProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              index < currentStep 
                ? 'bg-willtank-500 text-white' 
                : index === currentStep 
                ? 'bg-willtank-100 border-2 border-willtank-500 text-willtank-700' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs mt-1 text-center ${
              index <= currentStep ? 'text-willtank-600' : 'text-gray-400'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1 bg-gray-200 rounded-full">
        <div 
          className="absolute top-0 left-0 h-1 bg-willtank-500 rounded-full"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
