
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSubscriptionStatus, SubscriptionStatus } from '@/services/subscriptionService';

export function useSubscriptionStatus() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isTrial: false,
    tier: 'free',
    trialDaysRemaining: 0,
    trialEnd: null,
    features: ['Basic will creation', 'Document storage'],
    plan: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshSubscriptionStatus = useCallback(async () => {
    // Prevent duplicate requests
    if (isRefreshingRef.current) {
      console.log('Subscription status refresh already in progress, skipping...');
      return;
    }

    try {
      isRefreshingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('Refreshing subscription status...');
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err: any) {
      console.error('Error fetching subscription status:', err);
      setError(err.message || 'Could not fetch subscription status');
      
      // Even if there's an error, set default values and exit loading state
      setSubscriptionStatus({
        isSubscribed: false,
        isTrial: false,
        tier: 'free',
        trialDaysRemaining: 0,
        trialEnd: null,
        features: ['Basic will creation', 'Document storage'],
        plan: null
      });
    } finally {
      setLoading(false);
      isRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    refreshSubscriptionStatus();
  }, [refreshSubscriptionStatus]);

  return {
    subscriptionStatus,
    loading,
    error,
    refreshSubscriptionStatus
  };
}
