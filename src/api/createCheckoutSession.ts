
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      toast.error('Failed to create checkout session', {
        description: error.message
      });
      throw new Error(error.message);
    }

    if (!data || !data.url) {
      console.error('Invalid response from checkout session function:', data);
      toast.error('Invalid response from payment service');
      throw new Error('Invalid response from payment service');
    }

    console.log('Successfully created checkout session, redirecting to:', data.url);
    return data;
  } catch (error) {
    console.error('Error invoking create-checkout-session:', error);
    toast.error('Payment processing error', {
      description: 'Could not connect to payment service. Please try again later.'
    });
    throw error;
  }
}
