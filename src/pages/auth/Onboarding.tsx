
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { GoalsStep } from '@/components/onboarding/steps/GoalsStep';
import { PreferencesStep } from '@/components/onboarding/steps/PreferencesStep';
import { CompletionStep } from '@/components/onboarding/steps/CompletionStep';
import { useToast } from '@/hooks/use-toast';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Welcome to WillTank!",
      description: "Your journey towards securing your digital legacy begins now.",
    });
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />;
      case 2:
        return <GoalsStep onNext={handleNext} />;
      case 3:
        return <PreferencesStep onNext={handleNext} />;
      case 4:
        return <CompletionStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout step={currentStep} totalSteps={totalSteps}>
      {renderStep()}
    </OnboardingLayout>
  );
}
