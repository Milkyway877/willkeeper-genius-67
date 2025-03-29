
import { supabase } from '@/integrations/supabase/client';

export async function createCheckoutSession(plan: string, billingPeriod: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { plan, billingPeriod },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Error creating checkout session');
    }
    
    if (!data.url) {
      throw new Error('No checkout URL returned from server');
    }
    
    return { url: data.url, status: 'success' };
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    return { url: '#', status: 'error', error: error.message };
  }
}
