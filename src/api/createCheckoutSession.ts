
import { supabase } from '@/integrations/supabase/client';

export async function createCheckoutSession(plan: string, billingPeriod: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: JSON.stringify({ 
        plan, 
        billingPeriod 
      })
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error invoking create-checkout-session:', error);
    throw error;
  }
}
