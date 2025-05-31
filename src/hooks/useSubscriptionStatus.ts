
import { useState, useEffect } from 'react';
import { getSubscriptionStatus, SubscriptionStatus } from '@/services/subscriptionService';

export const useSubscriptionStatus = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    plan: null,
    tier: 'free',
    features: ['Basic will creation']
  });
  const [loading, setLoading] = useState(true);

  const refreshSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscriptionStatus();
  }, []);

  return {
    subscriptionStatus,
    loading,
    refreshSubscriptionStatus
  };
};
