
import { useState, useCallback } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { toast } from 'sonner';

export const useWillSubscriptionFlow = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscriptionStatus();

  const handleWillSaved = useCallback(async (isFirstWill: boolean = false) => {
    if (isFirstWill && !subscriptionStatus.isSubscribed) {
      // Show subscription modal for first will
      setShowSubscriptionModal(true);
      toast.success('Will saved successfully!', {
        description: 'Upgrade to unlock Tank messages and premium features.'
      });
    } else {
      toast.success('Will saved successfully!');
    }
  }, [subscriptionStatus.isSubscribed]);

  const handleSubscriptionSuccess = useCallback(async () => {
    setShowSubscriptionModal(false);
    await refreshSubscriptionStatus();
    toast.success('Welcome to WillTank Pro!', {
      description: 'You now have access to all premium features.'
    });
  }, [refreshSubscriptionStatus]);

  const closeSubscriptionModal = useCallback(() => {
    setShowSubscriptionModal(false);
  }, []);

  return {
    showSubscriptionModal,
    handleWillSaved,
    handleSubscriptionSuccess,
    closeSubscriptionModal,
    subscriptionStatus
  };
};
