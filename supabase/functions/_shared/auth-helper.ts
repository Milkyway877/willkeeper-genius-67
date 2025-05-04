
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

export const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables for Supabase client');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

export const generateVerificationCode = (): string => {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const logVerificationEvent = async (
  email: string, 
  type: string, 
  action: string, 
  details: Record<string, any> = {}
): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient();
    
    await supabase
      .from('verification_logs')
      .insert({
        email,
        type,
        action,
        details: details,
        created_at: new Date().toISOString()
      });
      
    return true;
  } catch (error) {
    console.error('Failed to log verification event:', error);
    return false;
  }
};

export const storeVerificationCode = async (
  email: string,
  code: string,
  type: string,
  expiresInMinutes: number = 30
): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient();
    
    // Mark any existing active codes as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('email', email)
      .eq('type', type)
      .eq('used', false);
    
    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
    
    // Insert new code
    await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
        used: false,
        attempts: 0
      });
      
    return true;
  } catch (error) {
    console.error('Failed to store verification code:', error);
    return false;
  }
};

export const verifyCode = async (
  email: string,
  code: string,
  type: string
): Promise<{ isValid: boolean; message?: string }> => {
  try {
    const supabase = getSupabaseClient();
    
    // Get the most recent valid code
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error || !data || data.length === 0) {
      // Record failed attempt if we found a matching code but it's expired or used
      const { data: matchingCodes } = await supabase
        .from('verification_codes')
        .select('id, attempts')
        .eq('email', email)
        .eq('code', code)
        .eq('type', type)
        .limit(1);
        
      if (matchingCodes && matchingCodes.length > 0) {
        // Increment attempts counter
        await supabase
          .from('verification_codes')
          .update({ 
            attempts: (matchingCodes[0].attempts || 0) + 1 
          })
          .eq('id', matchingCodes[0].id);
          
        if ((matchingCodes[0].attempts || 0) >= 4) {
          return { isValid: false, message: 'Too many failed attempts. Please request a new code.' };
        }
      }
      
      return { isValid: false, message: 'Invalid or expired verification code' };
    }
    
    // Mark the code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', data[0].id);
      
    return { isValid: true };
  } catch (error) {
    console.error('Error verifying code:', error);
    return { isValid: false, message: 'An error occurred during verification' };
  }
};

export const updateUserSecurityProfile = async (
  userId: string,
  data: Record<string, any>
): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient();
    
    // Check if record exists
    const { data: existingRecord } = await supabase
      .from('user_security')
      .select('user_id')
      .eq('user_id', userId)
      .single();
      
    if (existingRecord) {
      // Update existing record
      await supabase
        .from('user_security')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create new record
      await supabase
        .from('user_security')
        .insert({
          user_id: userId,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update security profile:', error);
    return false;
  }
};
