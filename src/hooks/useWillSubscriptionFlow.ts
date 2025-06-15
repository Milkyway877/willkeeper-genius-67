
import { useState, useCallback, useEffect } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkUserHasWill } from '@/services/willCheckService';
import { checkUserHasTankMessage } from '@/services/tankService';
import { toast } from 'sonner';

type TriggerSource = "will" | "tank-message" | null;

// Utility to check if user is eligible for subscription prompt
const useEligibilityCheck = () => {
  const [hasWill, setHasWill] = useState(false);
  const [hasTankMessage, setHasTankMessage] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchEligibility = async () => {
      setEligibilityLoading(true);

      const willStatus = await checkUserHasWill();
      if (!cancelled) setHasWill(willStatus.hasWill);

      // checkUserHasTankMessage should return { hasTankMessage: boolean }
      let tankStatus = { hasTankMessage: false };
      try {
        tankStatus = await checkUserHasTankMessage();
      } catch (err) {
        tankStatus = { hasTankMessage: false };
      }
      if (!cancelled) setHasTankMessage(tankStatus.hasTankMessage);
      if (!cancelled) setEligibilityLoading(false);
    };
    fetchEligibility();
    return () => {
      cancelled = true;
    };
  }, []);
  return [hasWill, hasTankMessage, eligibilityLoading] as const;
};

export const useWillSubscriptionFlow = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [willStatus, setWillStatus] = useState({ hasWill: false, willCount: 0 });
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscriptionStatus();
  const [triggerSource, setTriggerSource] = useState<TriggerSource>(null);
  const [hasWill, hasTankMessage, eligibilityLoading] = useEligibilityCheck();

  // Check will status on mount
  useEffect(() => {
    const checkWills = async () => {
      const status = await checkUserHasWill();
      setWillStatus(status);
    };
    checkWills();
  }, []);

  // This is called upon will save or tank message creation
  const handleWillOrTankMessageSaved = useCallback(
    async (source: TriggerSource, isFirst: boolean = false) => {
      // Update state after saving
      const status = await checkUserHasWill();
      setWillStatus(status);

      // Show only if appropriate:
      if (
        isFirst &&
        !subscriptionStatus.isSubscribed &&
        ((source === "will" && status.hasWill) || (source === "tank-message" && hasTankMessage))
      ) {
        setShowSubscriptionModal(true);
        setTriggerSource(source);
        let msg =
          source === "tank-message"
            ? 'Tank message saved! Upgrade to unlock secure storage and premium messaging features.'
            : 'Will saved successfully! Upgrade to unlock Tank messages and premium features.';
        toast.success(msg);
      } else {
        toast.success(
          source === "tank-message"
            ? 'Tank message saved successfully!'
            : 'Will saved successfully!'
        );
      }
    },
    [subscriptionStatus.isSubscribed, hasTankMessage]
  );

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

  // Only show if user has at least one will or tank message
  const isEligible = hasWill || hasTankMessage;

  return {
    showSubscriptionModal: showSubscriptionModal && isEligible,
    handleWillOrTankMessageSaved, // Call with ('will', true) or ('tank-message', true) as needed
    handleSubscriptionSuccess,
    closeSubscriptionModal,
    subscriptionStatus,
    willStatus,
    triggerSource,
    hasWill,
    hasTankMessage,
    eligibilityLoading, // add this to return object
  };
};
