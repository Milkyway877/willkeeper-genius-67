
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function createCheckoutSession(plan: string, billingPeriod: string) {
  // Create a unique ID for this loading toast
  const loadingToastId = toast.loading("Preparing checkout...");
  
  try {
    console.log(`Creating checkout session for plan: ${plan}, billing period: ${billingPeriod}`);
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: JSON.stringify({ 
        plan, 
        billingPeriod 
      })
    });

    // Always dismiss the loading toast before showing any other toast
    toast.dismiss(loadingToastId);

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
    // Ensure any existing loading toasts are dismissed
    toast.dismiss(loadingToastId);
    toast.error('Payment processing error', {
      description: 'Could not connect to payment service. Please try again later.'
    });
    throw error;
  }
}
