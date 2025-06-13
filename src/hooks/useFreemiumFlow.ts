
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkUserHasExpiredContent, ContentStatus } from '@/services/freemiumService';

export const useFreemiumFlow = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  const checkExpiredContent = useCallback(async () => {
    const content = await checkUserHasExpiredContent();
    setExpiredContent(content);
    
    // Show modal if user has expired content and no subscription
    if (content.hasExpiredContent && !subscriptionStatus.isSubscribed) {
      setShowUpgradeModal(true);
    }
  }, [subscriptionStatus.isSubscribed]);

  const shouldShowUpgradePrompt = useCallback((contentId?: string) => {
    // Never show during active creation session
    if (!contentId) return false;
    
    // Don't show if user is subscribed
    if (subscriptionStatus.isSubscribed) return false;
    
    // Show if trying to access expired content
    const isExpired = [
      ...expiredContent.expiredWills,
      ...expiredContent.expiredVideos
    ].some(content => content.id === contentId);
    
    return isExpired;
  }, [subscriptionStatus.isSubscribed, expiredContent]);

  const triggerUpgradeModal = useCallback((reason?: 'expired_content' | 'grace_period' | 'general') => {
    if (!subscriptionStatus.isSubscribed) {
      setShowUpgradeModal(true);
    }
  }, [subscriptionStatus.isSubscribed]);

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

  // Check for expired content on mount and periodically
  useEffect(() => {
    checkExpiredContent();
    
    // Check every 5 minutes
    const interval = setInterval(checkExpiredContent, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkExpiredContent]);

  return {
    showUpgradeModal,
    expiredContent,
    shouldShowUpgradePrompt,
    triggerUpgradeModal,
    closeUpgradeModal,
    handleUpgradeSuccess,
    subscriptionStatus,
    checkExpiredContent
  };
};
