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
  const { profile, refreshProfile, user } = useUserProfile();
  const totalSteps = 4;
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("Onboarding page loaded", { 
      profile, 
      user: user ? "exists" : "null", 
      isActivated: profile?.is_activated 
    });
  }, [profile, user]);

  // Check if user is already onboarded and redirect if necessary
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (profile?.is_activated) {
        console.log("User is already activated, redirecting to dashboard");
        navigate('/dashboard');
      } else {
        console.log("User is not activated, staying on onboarding page");
        setHasCheckedProfile(true);
      }
    };
    
    if (profile) {
      checkOnboardingStatus();
    }
  }, [profile, navigate]);

  // Keep refreshing the profile until we have it
  useEffect(() => {
    let interval: number | undefined;
    
    if (!profile && user) {
      console.log("No profile found but user exists, refreshing profile");
      // First refresh immediately
      refreshProfile();
      
      // Then set an interval to keep checking
      interval = window.setInterval(() => {
        console.log("Refreshing user profile...");
        refreshProfile();
      }, 2000);
    } else if (profile) {
      // If we have a profile, clear the interval
      console.log("Profile found, clearing refresh interval");
      if (interval) {
        clearInterval(interval);
      }
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [profile, user, refreshProfile]);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in onboarding:", event, session?.user?.id);
      
      // If user signed in, refresh the profile
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("User signed in, refreshing profile");
        setTimeout(() => refreshProfile(), 500);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [refreshProfile]);

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
      console.log("Completing onboarding process");
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

  // Show a loading state while we're checking the profile
  if (!hasCheckedProfile && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading onboarding...</p>
      </div>
    );
  }

  return (
    <OnboardingLayout step={currentStep} totalSteps={totalSteps}>
      {renderStep()}
    </OnboardingLayout>
  );
}
