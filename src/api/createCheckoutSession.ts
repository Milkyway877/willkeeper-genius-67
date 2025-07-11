
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function createCheckoutSession(plan: string, billingPeriod: string, returnUrl?: string) {
  try {
    console.log('Creating checkout session for:', { plan, billingPeriod, returnUrl });
    
    // Use Supabase edge function instead of relative API path
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        plan, 
        billingPeriod,
        return_url: returnUrl || window.location.href
      }
    });

    console.log('Checkout session response:', { data, error });

    if (error) {
      console.error('Checkout session error:', error);
      toast.error('Payment processing error', {
        description: `Error creating checkout session: ${error.message}`,
      });
      return { status: 'error', error: error.message };
    }

    if (!data?.url) {
      console.error('No checkout URL returned from server');
      toast.error('Payment processing error', {
        description: 'No checkout URL returned from server',
      });
      return { status: 'error', error: 'No checkout URL' };
    }

    console.log('Checkout session created successfully:', data.url);
    return { status: 'success', url: data.url };
  } catch (error) {
    console.error('Checkout session error:', error);
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}
