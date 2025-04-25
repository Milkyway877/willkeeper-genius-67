
import { supabase } from '@/integrations/supabase/client';

export const sendVerificationEmail = async (email: string, type: 'signup' | 'login', firstName?: string) => {
  try {
    console.log(`Sending verification email to ${email}, type: ${type}`);
    
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email, type, firstName },
    });

    if (error) {
      console.error('Error invoking send-verification-email function:', error);
      return { success: false, error };
    }
    
    console.log('Verification email function response:', data);
    
    // Check if the response indicates success
    if (data && data.success === true) {
      return { success: true, data };
    } else {
      const errorMessage = data?.error || 'Email sending failed';
      console.error('Email sending failed with response:', data, 'Error:', errorMessage);
      return { 
        success: false, 
        error: { message: errorMessage } 
      };
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { 
      success: false, 
      error: { 
        message: error instanceof Error ? error.message : 'Unknown error sending verification email'
      } 
    };
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
      return { valid: false, message: 'Error checking verification code', error };
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
    return { 
      valid: false, 
      message: error instanceof Error ? error.message : 'Error verifying code'
    };
  }
};
