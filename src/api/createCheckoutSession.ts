
import { supabase } from '@/integrations/supabase/client';

export async function createCheckoutSession(plan: string, billingPeriod: string) {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session found. Please log in.');
    }
    
    // Invoke the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: JSON.stringify({ plan, billingPeriod }),
    });
    
    if (error) {
      console.error('Error calling checkout function:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
    
    if (!data || !data.url) {
      throw new Error('Invalid response from checkout function');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}
