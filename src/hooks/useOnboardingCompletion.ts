
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { toast } from '@/hooks/use-toast';

export const useOnboardingCompletion = () => {
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { updateProfile } = useUserProfile();

  const completeOnboarding = async () => {
    try {
      setIsCompleting(true);
      console.log('Completing onboarding...');
      
      let profileUpdateSuccess = false;
      
      // Try to update the profile, but don't let it block completion
      try {
        await updateProfile({ onboarding_completed: true });
        console.log('Profile updated successfully');
        profileUpdateSuccess = true;
      } catch (profileError) {
        console.error('Profile update failed:', profileError);
        // Log the error but continue - we'll show a warning toast
        toast({
          title: "Profile Update Warning", 
          description: "Onboarding completed but there was an issue saving your progress. This won't affect your access to the app.",
          variant: "default"
        });
      }
      
      // Always show success message and navigate
      if (profileUpdateSuccess) {
        toast({
          title: "Welcome to WillTank!",
          description: "Your account setup is complete. You're ready to get started.",
        });
      } else {
        toast({
          title: "Welcome to WillTank!",
          description: "Setup complete! You can now access your dashboard.",
        });
      }
      
      // Always navigate to dashboard - don't let profile issues block user access
      console.log('Navigating to dashboard...');
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Unexpected onboarding completion error:', error);
      // Even if there's an unexpected error, still let the user proceed
      toast({
        title: "Setup Complete",
        description: "Welcome! You can now access your dashboard.",
      });
      navigate('/dashboard', { replace: true });
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    completeOnboarding,
    isCompleting
  };
};
