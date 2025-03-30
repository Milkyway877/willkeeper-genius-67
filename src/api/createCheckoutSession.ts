
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function createCheckoutSession(plan: string, billingPeriod: string) {
  try {
    console.log('Creating checkout session for:', plan, billingPeriod);
    
    // Show a loading toast that can be updated later
    const toastId = toast.loading('Preparing checkout session...');
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { plan, billingPeriod },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Payment error', {
        description: `Error creating checkout session: ${error.message}`,
        id: toastId
      });
      throw new Error(`Error creating checkout session: ${error.message}`);
    }
    
    if (!data?.url) {
      console.error('No checkout URL returned from server', data);
      toast.error('Payment error', {
        description: 'No checkout URL returned from server',
        id: toastId
      });
      throw new Error('No checkout URL returned from server');
    }
    
    toast.success('Redirecting to checkout', {
      id: toastId
    });
    
    return { url: data.url, status: 'success' };
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    return { 
      url: '#', 
      status: 'error', 
      error: error.message || 'An unexpected error occurred' 
    };
  }
}
