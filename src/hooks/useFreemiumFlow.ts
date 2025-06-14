
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkUserHasExpiredContent, ContentStatus } from '@/services/freemiumService';
import { checkUserHasWill } from '@/services/willCheckService';

export const useFreemiumFlow = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [willStatus, setWillStatus] = useState({ hasWill: false, willCount: 0 });
  const [expiredContent, setExpiredContent] = useState<{
    hasExpiredContent: boolean;
    expiredWills: ContentStatus[];
    expiredVideos: ContentStatus[];
    gracePeriodContent: ContentStatus[];
  }>({
    hasExpiredContent: false,
    expiredWills: [],
    expiredVideos: [],
    gracePeriodContent: []
  });
  
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscriptionStatus();

  // Check will status
  useEffect(() => {
    const checkWills = async () => {
      const status = await checkUserHasWill();
      setWillStatus(status);
    };
    checkWills();
  }, []);

  const checkExpiredContent = useCallback(async () => {
    // Only check expired content if user has wills
    if (!willStatus.hasWill) {
      setExpiredContent({
        hasExpiredContent: false,
        expiredWills: [],
        expiredVideos: [],
        gracePeriodContent: []
      });
      return;
    }

    const content = await checkUserHasExpiredContent();
    setExpiredContent(content);
    
    // Show modal if user has expired content and no subscription AND has wills
    if (content.hasExpiredContent && !subscriptionStatus.isSubscribed && willStatus.hasWill) {
      setShowUpgradeModal(true);
    }
  }, [subscriptionStatus.isSubscribed, willStatus.hasWill]);

  const shouldShowUpgradePrompt = useCallback((contentId?: string) => {
    // Never show during active creation session
    if (!contentId) return false;
    
    // Don't show if user is subscribed
    if (subscriptionStatus.isSubscribed) return false;
    
    // Don't show if user has no wills
    if (!willStatus.hasWill) return false;
    
    // Show if trying to access expired content
    const isExpired = [
      ...expiredContent.expiredWills,
      ...expiredContent.expiredVideos
    ].some(content => content.id === contentId);
    
    return isExpired;
  }, [subscriptionStatus.isSubscribed, expiredContent, willStatus.hasWill]);

  const triggerUpgradeModal = useCallback((reason?: 'expired_content' | 'grace_period' | 'general') => {
    // Only trigger if user is not subscribed AND has wills
    if (!subscriptionStatus.isSubscribed && willStatus.hasWill) {
      setShowUpgradeModal(true);
    }
  }, [subscriptionStatus.isSubscribed, willStatus.hasWill]);

  const closeUpgradeModal = useCallback(() => {
    // Only allow closing if no expired content (force upgrade for expired content)
    if (!expiredContent.hasExpiredContent) {
      setShowUpgradeModal(false);
    }
  }, [expiredContent.hasExpiredContent]);

  const handleUpgradeSuccess = useCallback(async () => {
    setShowUpgradeModal(false);
    await refreshSubscriptionStatus();
    // Refresh expired content status
    await checkExpiredContent();
  }, [refreshSubscriptionStatus, checkExpiredContent]);

  // Check for expired content when will status changes
  useEffect(() => {
    checkExpiredContent();
    
    // Only set up interval if user has wills
    if (willStatus.hasWill) {
      const interval = setInterval(checkExpiredContent, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [checkExpiredContent, willStatus.hasWill]);

  return {
    showUpgradeModal: showUpgradeModal && willStatus.hasWill,
    expiredContent,
    shouldShowUpgradePrompt,
    triggerUpgradeModal,
    closeUpgradeModal,
    handleUpgradeSuccess,
    subscriptionStatus,
    checkExpiredContent,
    willStatus
  };
};
