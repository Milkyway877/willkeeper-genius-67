
import { useState, useCallback, useEffect } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkUserHasWill } from '@/services/willCheckService';
import { toast } from 'sonner';

export const useWillSubscriptionFlow = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [willStatus, setWillStatus] = useState({ hasWill: false, willCount: 0 });
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscriptionStatus();

  // Check will status on mount
  useEffect(() => {
    const checkWills = async () => {
      const status = await checkUserHasWill();
      setWillStatus(status);
    };
    checkWills();
  }, []);

  const handleWillSaved = useCallback(async (isFirstWill: boolean = false) => {
    // Update will status after saving
    const status = await checkUserHasWill();
    setWillStatus(status);

    if (isFirstWill && !subscriptionStatus.isSubscribed && status.hasWill) {
      // Show subscription modal only for first will and only if user is not subscribed
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
    showSubscriptionModal: showSubscriptionModal && willStatus.hasWill,
    handleWillSaved,
    handleSubscriptionSuccess,
    closeSubscriptionModal,
    subscriptionStatus,
    willStatus
  };
};
