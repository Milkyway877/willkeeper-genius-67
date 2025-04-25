
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { GoalsStep } from '@/components/onboarding/steps/GoalsStep';
import { PreferencesStep } from '@/components/onboarding/steps/PreferencesStep';
import { CompletionStep } from '@/components/onboarding/steps/CompletionStep';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { updateUserProfile } from '@/services/profileService';
import { logUserActivity } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

// Interface for selected goals and preferences
interface UserGoals {
  digitalWill: boolean;
  legacyPlanning: boolean;
  messageVault: boolean;
}

interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  autoBackup: boolean;
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<UserGoals>({
    digitalWill: false,
    legacyPlanning: false,
    messageVault: false
  });
  const [selectedPreferences, setSelectedPreferences] = useState<UserPreferences>({
    notifications: true,
    darkMode: false,
    autoBackup: true
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, refreshProfile } = useUserProfile();
  const totalSteps = 4;

  // Check if user is already onboarded and redirect if necessary
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (profile?.is_activated) {
        navigate('/dashboard');
      }
    };
    
    if (profile) {
      checkOnboardingStatus();
    }
  }, [profile, navigate]);

  const handleGoalSelection = (goals: UserGoals) => {
    setSelectedGoals(goals);
  };

  const handlePreferenceSelection = (preferences: UserPreferences) => {
    setSelectedPreferences(preferences);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Log the step completion
      logUserActivity(`onboarding_step_${currentStep}_completed`, {
        step: currentStep,
        totalSteps
      });
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Update user profile to mark onboarding as completed
      const updatedProfile = await updateUserProfile({ 
        is_activated: true,
        activation_date: new Date().toISOString(),
      });
      
      if (updatedProfile) {
        // Log onboarding completion
        await logUserActivity('onboarding_completed', {
          goals: selectedGoals,
          preferences: selectedPreferences
        });
        
        // Refresh the profile to get the updated data
        await refreshProfile();
        
        toast({
          title: "Welcome to WillTank!",
          description: "Your journey towards securing your digital legacy begins now.",
        });
        
        navigate('/dashboard');
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Oops! Something went wrong",
        description: "We couldn't complete your onboarding. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />;
      case 2:
        return <GoalsStep onNext={handleNext} onGoalSelection={handleGoalSelection} selectedGoals={selectedGoals} />;
      case 3:
        return <PreferencesStep onNext={handleNext} onPreferenceSelection={handlePreferenceSelection} selectedPreferences={selectedPreferences} />;
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
