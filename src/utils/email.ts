
import { supabase } from '@/integrations/supabase/client';

export const sendVerificationEmail = async (email: string, type: 'signup' | 'login', firstName?: string) => {
  try {
    console.log(`Sending verification email to ${email}, type: ${type}`);
    
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email, type, firstName },
    });

    if (error) {
      console.error('Error invoking send-verification-email function:', error);
      throw error;
    }
    
    console.log('Verification email function response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const verifyCode = async (email: string, code: string, type: 'signup' | 'login') => {
  try {
    console.log(`Verifying code for ${email}, type: ${type}, code: ${code}`);
    
    const { data, error } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error querying verification code:', error);
      throw error;
    }
    
    if (!data) {
      console.log('Invalid or expired code');
      return { valid: false, message: 'Invalid or expired code' };
    }

    // Mark the code as used
    const { error: updateError } = await supabase
      .from('email_verification_codes')
      .update({ used: true })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error marking code as used:', updateError);
      // Continue anyway, since verification was successful
    }

    console.log('Code verified successfully');
    return { valid: true };
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};
