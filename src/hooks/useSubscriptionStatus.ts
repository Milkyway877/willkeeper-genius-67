
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
  const previousSubscriptionState = useRef<boolean>(false);

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
      
      // Check if subscription status changed from unsubscribed to subscribed
      const wasUnsubscribed = !previousSubscriptionState.current;
      const isNowSubscribed = status.isSubscribed || status.isTrial;
      
      if (wasUnsubscribed && isNowSubscribed) {
        console.log('User upgraded from free to subscribed - triggering comprehensive cleanup');
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Trigger both subscription upgrade handler and freemium cleanup
          const cleanupPromises = [
            supabase.functions.invoke('handle-subscription-upgrade', {
              body: {
                user_id: session.user.id,
                user_email: session.user.email
              }
            }),
            supabase.functions.invoke('cleanup-freemium-state', {
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            })
          ];
          
          try {
            await Promise.allSettled(cleanupPromises);
            console.log('Comprehensive cleanup completed for subscription upgrade');
          } catch (cleanupError) {
            console.error('Error during cleanup operations:', cleanupError);
          }
        }
      }
      
      // Update previous state
      previousSubscriptionState.current = isNowSubscribed;
      
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
