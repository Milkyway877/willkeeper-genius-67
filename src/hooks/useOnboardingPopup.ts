
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
  const { data: onboardingStatus, isLoading, error } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async (): Promise<OnboardingStatus> => {
      console.log('[ONBOARDING] Fetching onboarding status...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('[ONBOARDING] No session found, skipping popup');
        return { onboarding_completed: true }; // Don't show for non-authenticated users
      }

      console.log('[ONBOARDING] User session found, checking status...');

      const { data, error } = await supabase.functions.invoke('get-onboarding-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('[ONBOARDING] Error fetching onboarding status:', error);
        return { onboarding_completed: true }; // Default to completed on error
      }

      console.log('[ONBOARDING] Status response:', data);
      return data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mutation to complete onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      console.log('[ONBOARDING] Completing onboarding...');
      
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
        console.error('[ONBOARDING] Error completing onboarding:', error);
        throw error;
      }

      console.log('[ONBOARDING] Onboarding completed successfully');
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

  // Show onboarding popup after 3 seconds if not completed
  useEffect(() => {
    console.log('[ONBOARDING] Effect triggered:', { isLoading, onboardingStatus, error });
    
    if (error) {
      console.error('[ONBOARDING] Query error:', error);
      return;
    }
    
    if (!isLoading && onboardingStatus) {
      console.log('[ONBOARDING] Onboarding status:', onboardingStatus);
      
      if (!onboardingStatus.onboarding_completed) {
        console.log('[ONBOARDING] Onboarding not completed, showing popup in 3 seconds...');
        // 3-second delay to ensure dashboard is loaded
        const timer = setTimeout(() => {
          console.log('[ONBOARDING] Showing onboarding popup now');
          setShowOnboarding(true);
        }, 3000);
        
        return () => {
          console.log('[ONBOARDING] Clearing timer');
          clearTimeout(timer);
        };
      } else {
        console.log('[ONBOARDING] Onboarding already completed, not showing popup');
      }
    }
  }, [isLoading, onboardingStatus, error]);

  const closeOnboarding = () => {
    console.log('[ONBOARDING] Closing onboarding popup');
    setShowOnboarding(false);
  };

  const completeOnboarding = async () => {
    try {
      console.log('[ONBOARDING] User clicked complete onboarding');
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
