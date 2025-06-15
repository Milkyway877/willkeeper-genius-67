import { useState, useCallback, useEffect, useRef } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkUserHasWill } from '@/services/willCheckService';
import { checkUserHasTankMessage } from '@/services/tankService';
import { toast } from 'sonner';

type TriggerSource = "will" | "tank-message" | null;

// Central eligibility hook with strict race & call order guards
const useEligibilityCheck = () => {
  const [hasWill, setHasWill] = useState(false);
  const [hasTankMessage, setHasTankMessage] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const currentRequestId = useRef(0);

  // Fetcher always runs, never conditional
  const fetchEligibility = useCallback(async () => {
    setEligibilityLoading(true);
    currentRequestId.current += 1;
    const requestId = currentRequestId.current;

    try {
      const willStatus = await checkUserHasWill();
      const tankStatus = await checkUserHasTankMessage();

      if (requestId !== currentRequestId.current) return;
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

  useEffect(() => {
    fetchEligibility();
    // eslint-disable-next-line
  }, []);

  const refreshEligibility = useCallback(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  return [hasWill, hasTankMessage, eligibilityLoading, refreshEligibility] as const;
};

export const useWillSubscriptionFlow = () => {
  // All stateful hooks (order matters - no conditionals above these)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [willStatus, setWillStatus] = useState({ hasWill: false, willCount: 0 });
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscriptionStatus();
  const [triggerSource, setTriggerSource] = useState<"will" | "tank-message" | null>(null);

  // Strict hook call order
  const [
    hasWill,
    hasTankMessage,
    eligibilityLoading,
    refreshEligibility,
  ] = useEligibilityCheck();

  // Sync willStatus on eligibility change
  useEffect(() => {
    let mounted = true;
    async function checkWills() {
      const status = await checkUserHasWill();
      if (mounted) setWillStatus(status);
    }
    checkWills();
    return () => { mounted = false; };
  }, [hasWill]);

  // Strictly organized callbacks, never skipping hooks
  const handleWillOrTankMessageSaved = useCallback(
    async (source: "will" | "tank-message" | null, isFirst: boolean = false) => {
      await refreshEligibility();
      const status = await checkUserHasWill();
      setWillStatus(status);

      if (
        isFirst &&
        !subscriptionStatus.isSubscribed &&
        ((source === "will" && status.hasWill) || (source === "tank-message" && hasTankMessage))
      ) {
        setShowSubscriptionModal(true);
        setTriggerSource(source);
        const msg = source === "tank-message"
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
      refreshEligibility();
    },
    [subscriptionStatus.isSubscribed, hasTankMessage, refreshEligibility]
  );

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

  // Debug order: always log when run, for debug only (remove in production)
  // console.log('useWillSubscriptionFlow order', { hasWill, hasTankMessage, eligibilityLoading });

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
