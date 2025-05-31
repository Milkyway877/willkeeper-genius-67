
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: string | null;
  tier: 'free' | 'starter' | 'gold' | 'platinum';
  features: string[];
}

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return {
        isSubscribed: false,
        plan: null,
        tier: 'free',
        features: ['Basic will creation']
      };
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) {
      return {
        isSubscribed: false,
        plan: null,
        tier: 'free',
        features: ['Basic will creation']
      };
    }

    // Determine tier based on plan
    let tier: 'free' | 'starter' | 'gold' | 'platinum' = 'free';
    let features: string[] = ['Basic will creation'];

    if (subscription.plan === 'starter') {
      tier = 'starter';
      features = [
        'Basic will templates',
        'Up to 2 future messages',
        'Standard encryption',
        'Email support',
        '5GB document storage'
      ];
    } else if (subscription.plan === 'gold') {
      tier = 'gold';
      features = [
        'Advanced will templates',
        'Up to 10 future messages',
        'Enhanced encryption',
        'Priority email support',
        '20GB document storage',
        'AI document analysis'
      ];
    } else if (subscription.plan === 'platinum') {
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

    return {
      isSubscribed: true,
      plan: subscription.plan,
      tier,
      features
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      isSubscribed: false,
      plan: null,
      tier: 'free',
      features: ['Basic will creation']
    };
  }
};

export const checkFeatureAccess = (requiredTier: string, userTier: string): boolean => {
  const tierHierarchy = ['free', 'starter', 'gold', 'platinum'];
  const userTierIndex = tierHierarchy.indexOf(userTier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
};
