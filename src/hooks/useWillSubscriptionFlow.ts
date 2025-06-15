import { useState, useCallback, useEffect, useRef } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkUserHasWill } from '@/services/willCheckService';
import { checkUserHasTankMessage } from '@/services/tankService';
import { toast } from 'sonner';

type TriggerSource = "will" | "tank-message" | null;

// Central eligibility hook with refresh support and race condition protection
const useEligibilityCheck = () => {
  const [hasWill, setHasWill] = useState(false);
  const [hasTankMessage, setHasTankMessage] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const pendingRequestRef = useRef<Promise<void> | null>(null);

  // Ref for canceling outdated fetches
  const currentRequestId = useRef(0);

  // Main fetcher - debounced manually
  const fetchEligibility = useCallback(async () => {
    setEligibilityLoading(true);
    currentRequestId.current += 1;
    const requestId = currentRequestId.current;

    try {
      const willStatus = await checkUserHasWill();
      const tankStatus = await checkUserHasTankMessage();

      if (requestId !== currentRequestId.current) return; // Outdated response, skip
      setHasWill(!!willStatus.hasWill);
      setHasTankMessage(!!tankStatus.hasTankMessage);
    } catch (err) {
      if (requestId !== currentRequestId.current) return;
      setHasWill(false);
      setHasTankMessage(false);
    } finally {
      if (requestId === currentRequestId.current) setEligibilityLoading(false);
    }
  }, []);

  // Effect for initial load
  useEffect(() => {
    fetchEligibility();
    // Don't deps on fetchEligibility, it's stable
    // eslint-disable-next-line
  }, []);

  // Public trigger for consumers to refresh state after changes
  const refreshEligibility = useCallback(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  return [hasWill, hasTankMessage, eligibilityLoading, refreshEligibility] as const;
};

export const useWillSubscriptionFlow = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [willStatus, setWillStatus] = useState({ hasWill: false, willCount: 0 });
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscriptionStatus();
  const [triggerSource, setTriggerSource] = useState<TriggerSource>(null);

  // Central eligibility; always keep in sync
  const [
    hasWill,
    hasTankMessage,
    eligibilityLoading,
    refreshEligibility
  ] = useEligibilityCheck();

  // Update will status on mount and whenever eligibility refreshes
  useEffect(() => {
    const checkWills = async () => {
      const status = await checkUserHasWill();
      setWillStatus(status);
    };
    checkWills();
  }, [hasWill]);

  // This is called upon will/tank message creation OR deletion
  const handleWillOrTankMessageSaved = useCallback(
    async (source: TriggerSource, isFirst: boolean = false) => {
      // Re-fetch eligibility for authoritative status
      await refreshEligibility();

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
      // Always refresh eligibility after save
      refreshEligibility();
    },
    [subscriptionStatus.isSubscribed, hasTankMessage, refreshEligibility]
  );

  // Call this after a will/tank message is deleted to recheck eligibility on dashboard/sidebar/etc
  const handleContentDeleted = useCallback(() => {
    refreshEligibility();
  }, [refreshEligibility]);

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

  // Only show if user has at least one will or tank message AND everything is done loading
  const isEligible = !eligibilityLoading && (hasWill || hasTankMessage);

  return {
    showSubscriptionModal: showSubscriptionModal && isEligible,
    handleWillOrTankMessageSaved, // Call after save
    handleContentDeleted,         // Call after deletion
    handleSubscriptionSuccess,
    closeSubscriptionModal,
    subscriptionStatus,
    willStatus,
    triggerSource,
    hasWill,
    hasTankMessage,
    eligibilityLoading,
    refreshEligibility,
  };
};
