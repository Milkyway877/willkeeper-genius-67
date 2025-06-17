
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStatus {
  onboarding_completed: boolean;
}

export const useOnboardingPopup = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();

  // Query to get onboarding status
  const { data: onboardingStatus, isLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async (): Promise<OnboardingStatus> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { onboarding_completed: true }; // Don't show for non-authenticated users
      }

      const { data, error } = await supabase.functions.invoke('get-onboarding-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error fetching onboarding status:', error);
        return { onboarding_completed: true }; // Default to completed on error
      }

      return data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mutation to complete onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase.functions.invoke('complete-onboarding', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate the onboarding status query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      setShowOnboarding(false);
    },
    onError: (error) => {
      console.error('Error completing onboarding:', error);
    },
  });

  // Show onboarding popup after 5 seconds if not completed
  useEffect(() => {
    if (!isLoading && onboardingStatus && !onboardingStatus.onboarding_completed) {
      console.log('Onboarding not completed, showing popup in 5 seconds...');
      // 5-second delay to ensure dashboard is loaded
      const timer = setTimeout(() => {
        console.log('Showing onboarding popup now');
        setShowOnboarding(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, onboardingStatus]);

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  const completeOnboarding = async () => {
    try {
      await completeOnboardingMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still close the popup even if the API call fails
      setShowOnboarding(false);
    }
  };

  return {
    showOnboarding,
    closeOnboarding,
    completeOnboarding,
    isCompleting: completeOnboardingMutation.isPending,
    isLoading,
  };
};
