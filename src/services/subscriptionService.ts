
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: string | null;
  tier: 'free' | 'starter' | 'gold' | 'platinum';
  features: string[];
  isTrial: boolean;
  trialEnd: string | null;
  trialDaysRemaining: number;
}

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return {
        isSubscribed: false,
        plan: null,
        tier: 'free',
        features: ['Basic will creation'],
        isTrial: false,
        trialEnd: null,
        trialDaysRemaining: 0
      };
    }

    console.log('Checking subscription status for user:', session.user.email);

    // Add a timeout to prevent infinite waiting
    const timeoutPromise = new Promise<{ status: string; error: string }>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout checking subscription status')), 8000);
    });

    const checkPromise = supabase.functions.invoke('check-subscription');
    
    // Race between the actual check and the timeout
    const { data, error } = await Promise.race([
      checkPromise,
      timeoutPromise
    ]) as any;

    if (error) {
      console.error('Error checking subscription:', error);
      return {
        isSubscribed: false,
        plan: null,
        tier: 'free',
        features: ['Basic will creation'],
        isTrial: false,
        trialEnd: null,
        trialDaysRemaining: 0
      };
    }

    console.log('Subscription check response:', data);

    // Calculate trial days remaining if in trial
    let trialDaysRemaining = 0;
    if (data.is_trial && data.trial_end) {
      const trialEnd = new Date(data.trial_end);
      const now = new Date();
      trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Determine tier and features based on plan
    let tier: 'free' | 'starter' | 'gold' | 'platinum' = 'free';
    let features: string[] = ['Basic will creation'];

    if (data.subscription_tier) {
      const planName = data.subscription_tier.toLowerCase();
      if (planName === 'starter') {
        tier = 'starter';
        features = [
          'Basic will templates',
          'Up to 2 future messages',
          'Standard encryption',
          'Email support',
          '5GB document storage'
        ];
      } else if (planName === 'gold') {
        tier = 'gold';
        features = [
          'Advanced will templates',
          'Up to 10 future messages',
          'Enhanced encryption',
          'Priority email support',
          '20GB document storage',
          'AI document analysis'
        ];
      } else if (planName === 'platinum') {
        tier = 'platinum';
        features = [
          'Premium legal templates',
          'Unlimited future messages',
          'Military-grade encryption',
          '24/7 priority support',
          '100GB document storage',
          'Advanced AI tools',
          'Family sharing (up to 5 users)'
        ];
      }
    }

    // User is considered subscribed if they have active subscription OR active trial
    const isSubscribed = data.subscribed || (data.is_trial && trialDaysRemaining > 0);

    return {
      isSubscribed,
      plan: data.subscription_tier,
      tier,
      features,
      isTrial: data.is_trial || false,
      trialEnd: data.trial_end,
      trialDaysRemaining
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    // Ensure we return a valid status even on error
    return {
      isSubscribed: false,
      plan: null,
      tier: 'free',
      features: ['Basic will creation'],
      isTrial: false,
      trialEnd: null,
      trialDaysRemaining: 0
    };
  }
};

export const checkFeatureAccess = (requiredTier: string, userTier: string): boolean => {
  const tierHierarchy = ['free', 'starter', 'gold', 'platinum'];
  const userTierIndex = tierHierarchy.indexOf(userTier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
};
