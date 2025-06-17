
import { useState, useEffect } from 'react';

export const useOnboardingPopup = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem('willtank_onboarding_completed');
    
    if (!onboardingCompleted) {
      // Small delay to ensure dashboard is loaded
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    closeOnboarding
  };
};
