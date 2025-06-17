
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { checkUserHasExpiredContent, ContentStatus } from '@/services/freemiumService';
import { checkUserHasWill } from '@/services/willCheckService';
import { supabase } from '@/integrations/supabase/client';

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
  const previousSubscriptionState = useRef<boolean>(false);

  // Check will status
  useEffect(() => {
    const checkWills = async () => {
      const status = await checkUserHasWill();
      setWillStatus(status);
    };
    checkWills();
  }, []);

  // Monitor subscription changes and clear freemium state when user upgrades
  useEffect(() => {
    const currentSubscribed = subscriptionStatus.isSubscribed || subscriptionStatus.isTrial;
    const wasUnsubscribed = !previousSubscriptionState.current;
    
    if (wasUnsubscribed && currentSubscribed) {
      console.log('Subscription activated - clearing freemium state');
      
      // Immediately clear expired content state
      setExpiredContent({
        hasExpiredContent: false,
        expiredWills: [],
        expiredVideos: [],
        gracePeriodContent: []
      });
      
      // Close any open modal
      setShowUpgradeModal(false);
      
      // Trigger backend cleanup
      triggerSubscriptionCleanup();
    }
    
    // Update previous state
    previousSubscriptionState.current = currentSubscribed;
  }, [subscriptionStatus.isSubscribed, subscriptionStatus.isTrial]);

  const triggerSubscriptionCleanup = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.functions.invoke('handle-subscription-upgrade', {
          body: {
            user_id: session.user.id,
            user_email: session.user.email
          }
        });
        console.log('Subscription cleanup triggered successfully');
      }
    } catch (error) {
      console.error('Error triggering subscription cleanup:', error);
    }
  };

  const checkExpiredContent = useCallback(async () => {
    // Don't check for expired content if user is subscribed
    if (subscriptionStatus.isSubscribed || subscriptionStatus.isTrial) {
      setExpiredContent({
        hasExpiredContent: false,
        expiredWills: [],
        expiredVideos: [],
        gracePeriodContent: []
      });
      return;
    }

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
    if (content.hasExpiredContent && !subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial && willStatus.hasWill) {
      setShowUpgradeModal(true);
    }
  }, [subscriptionStatus.isSubscribed, subscriptionStatus.isTrial, willStatus.hasWill]);

  const shouldShowUpgradePrompt = useCallback((contentId?: string) => {
    // Never show during active creation session
    if (!contentId) return false;
    
    // Don't show if user is subscribed or in trial
    if (subscriptionStatus.isSubscribed || subscriptionStatus.isTrial) return false;
    
    // Don't show if user has no wills
    if (!willStatus.hasWill) return false;
    
    // Show if trying to access expired content
    const isExpired = [
      ...expiredContent.expiredWills,
      ...expiredContent.expiredVideos
    ].some(content => content.id === contentId);
    
    return isExpired;
  }, [subscriptionStatus.isSubscribed, subscriptionStatus.isTrial, expiredContent, willStatus.hasWill]);

  const triggerUpgradeModal = useCallback((reason?: 'expired_content' | 'grace_period' | 'general') => {
    // Only trigger if user is not subscribed AND has wills
    if (!subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial && willStatus.hasWill) {
      setShowUpgradeModal(true);
    }
  }, [subscriptionStatus.isSubscribed, subscriptionStatus.isTrial, willStatus.hasWill]);

  const closeUpgradeModal = useCallback(() => {
    // Only allow closing if no expired content OR user is subscribed
    if (!expiredContent.hasExpiredContent || subscriptionStatus.isSubscribed || subscriptionStatus.isTrial) {
      setShowUpgradeModal(false);
    }
  }, [expiredContent.hasExpiredContent, subscriptionStatus.isSubscribed, subscriptionStatus.isTrial]);

  const handleUpgradeSuccess = useCallback(async () => {
    setShowUpgradeModal(false);
    await refreshSubscriptionStatus();
    // Refresh expired content status
    await checkExpiredContent();
  }, [refreshSubscriptionStatus, checkExpiredContent]);

  // Check for expired content when will status changes, but not if subscribed
  useEffect(() => {
    if (!subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial) {
      checkExpiredContent();
      
      // Only set up interval if user has wills and is not subscribed
      if (willStatus.hasWill) {
        const interval = setInterval(checkExpiredContent, 5 * 60 * 1000);
        return () => clearInterval(interval);
      }
    }
  }, [checkExpiredContent, willStatus.hasWill, subscriptionStatus.isSubscribed, subscriptionStatus.isTrial]);

  // Determine if we should show upgrade modal - only if user has wills and is not subscribed
  const shouldShowModal = showUpgradeModal && willStatus.hasWill && !subscriptionStatus.isSubscribed && !subscriptionStatus.isTrial;

  return {
    showUpgradeModal: shouldShowModal,
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
