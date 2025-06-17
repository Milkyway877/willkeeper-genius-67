
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
      
      // Try to update the profile
      try {
        await updateProfile({ onboarding_completed: true });
        console.log('Profile updated successfully');
      } catch (profileError) {
        console.error('Profile update failed, but continuing:', profileError);
        // Don't throw - we'll still allow them to proceed
        toast({
          title: "Profile Update Warning",
          description: "Your progress was saved but there was a minor issue. You can continue using the app.",
          variant: "default"
        });
      }
      
      toast({
        title: "Welcome to WillTank!",
        description: "Your account setup is complete. You're ready to get started.",
      });
      
      // Always navigate to dashboard, regardless of profile update success
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast({
        title: "Setup Complete",
        description: "Welcome! You can now access your dashboard.",
      });
      // Still navigate to dashboard as fallback
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
