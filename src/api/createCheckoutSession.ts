
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function createCheckoutSession(plan: string, billingPeriod: string) {
  try {
    console.log(`Creating checkout session for plan: ${plan}, billing period: ${billingPeriod}`);
    
    // Show loading toast with an ID so we can dismiss it later
    const loadingToastId = toast.loading("Preparing checkout...");
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: JSON.stringify({ 
        plan, 
        billingPeriod 
      })
    });

    if (error) {
      console.error('Error from checkout session function:', error);
      // Dismiss the loading toast first
      toast.dismiss(loadingToastId);
      toast.error('Failed to create checkout session', {
        description: error.message
      });
      throw new Error(error.message);
    }

    if (!data || !data.url) {
      console.error('Invalid response from checkout session function:', data);
      // Dismiss the loading toast first
      toast.dismiss(loadingToastId);
      toast.error('Invalid response from payment service');
      throw new Error('Invalid response from payment service');
    }

    // Only dismiss the loading toast on success if we're about to redirect
    toast.dismiss(loadingToastId);
    console.log('Successfully created checkout session, redirecting to:', data.url);
    return data;
  } catch (error) {
    console.error('Error invoking create-checkout-session:', error);
    // Ensure any existing loading toasts are dismissed
    toast.dismiss();
    toast.error('Payment processing error', {
      description: 'Could not connect to payment service. Please try again later.'
    });
    throw error;
  }
}
