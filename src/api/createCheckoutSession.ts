
import { supabase } from '@/integrations/supabase/client';

export async function createCheckoutSession(plan: string, billingPeriod: string) {
  try {
    console.log(`Creating checkout session for plan: ${plan}, billing period: ${billingPeriod}`);
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: JSON.stringify({ 
        plan, 
        billingPeriod 
      })
    });

    if (error) {
      console.error('Error from checkout session function:', error);
      throw new Error(error.message);
    }

    if (!data || !data.url) {
      console.error('Invalid response from checkout session function:', data);
      throw new Error('Invalid response from payment service');
    }

    console.log('Successfully created checkout session, redirecting to:', data.url);
    return data;
  } catch (error) {
    console.error('Error invoking create-checkout-session:', error);
    throw error;
  }
}
