
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  isSubscribed: boolean;
  isTrial: boolean;
  tier: string;
  trialDaysRemaining: number;
  trialEnd: string | null;
  features: string[];
}

export function useSubscriptionStatus() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isTrial: false,
    tier: 'free',
    trialDaysRemaining: 0,
    trialEnd: null,
    features: ['Basic will creation', 'Document storage']
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setSubscriptionStatus({
          isSubscribed: false,
          isTrial: false,
          tier: 'free',
          trialDaysRemaining: 0,
          trialEnd: null,
          features: ['Basic will creation', 'Document storage']
        });
        return;
      }

      // Try to fetch subscription with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const subscriptionPromise = supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      const { data, error } = await Promise.race([subscriptionPromise, timeoutPromise]) as any;
      
      if (error) {
        console.warn('Could not fetch subscription:', error);
        // Set default free tier on error
        setSubscriptionStatus({
          isSubscribed: false,
          isTrial: false,
          tier: 'free',
          trialDaysRemaining: 0,
          trialEnd: null,
          features: ['Basic will creation', 'Document storage']
        });
        return;
      }

      if (data && data.length > 0) {
        const subscription = data[0];
        const isTrialActive = subscription.trial_end && new Date(subscription.trial_end) > new Date();
        const trialDaysLeft = isTrialActive 
          ? Math.ceil((new Date(subscription.trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        setSubscriptionStatus({
          isSubscribed: true,
          isTrial: isTrialActive,
          tier: subscription.stripe_price_id?.includes('gold') ? 'gold' : 
                subscription.stripe_price_id?.includes('platinum') ? 'platinum' : 'starter',
          trialDaysRemaining: trialDaysLeft,
          trialEnd: subscription.trial_end,
          features: [
            'Unlimited will creation',
            'Video testimonies',
            'Document attachments',
            'Premium templates',
            'Priority support'
          ]
        });
      } else {
        setSubscriptionStatus({
          isSubscribed: false,
          isTrial: false,
          tier: 'free',
          trialDaysRemaining: 0,
          trialEnd: null,
          features: ['Basic will creation', 'Document storage']
        });
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setError('Could not load subscription information');
      // Set default state on error
      setSubscriptionStatus({
        isSubscribed: false,
        isTrial: false,
        tier: 'free',
        trialDaysRemaining: 0,
        trialEnd: null,
        features: ['Basic will creation', 'Document storage']
      });
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
    error,
    refreshSubscriptionStatus
  };
}
