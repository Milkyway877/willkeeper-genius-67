
import { supabase } from "@/integrations/supabase/client";
import otpauth from 'otpauth';

// Get user security settings
export const getUserSecurity = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
    console.log("Getting security info for user:", user.id);
    
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      // Handle 406 errors gracefully
      if (error.code === '406') {
        console.warn("Content negotiation issue with security data fetch, returning empty security record");
        return null;
      }
      
      console.error('Error fetching user security:', error);
      return null;
    }
    
    console.log("User security record:", data);
    return data;
  } catch (error) {
    console.error('Error in getUserSecurity:', error);
    return null;
  }
};

// Create user security record if it doesn't exist
export const createUserSecurity = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
    // Generate a random encryption key for the user
    const encryptionKey = generateRandomString(32);
    
    const { data, error } = await supabase
      .from('user_security')
      .insert([
        { 
          user_id: user.id,
          encryption_key: encryptionKey,
          google_auth_enabled: false 
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user security:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createUserSecurity:', error);
    return null;
  }
};

// Generate a random TOTP secret for 2FA
export const generateTOTPSecret = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return { secret: '', qrCodeUrl: '' };
    }
    
    // Generate a new TOTP secret
    const secret = generateRandomString(20);
    
    // Create a new TOTP object
    const totp = new otpauth.TOTP({
      issuer: 'WillTank',
      label: user.email || 'User',
      secret: otpauth.Secret.fromBase32(secret),
      digits: 6,
      period: 30
    });
    
    // Generate the Auth URI to use in a QR code
    const qrCodeUrl = totp.toString();
    
    return { secret, qrCodeUrl };
  } catch (error) {
    console.error('Error generating TOTP secret:', error);
    return { secret: '', qrCodeUrl: '' };
  }
};

// Validate a TOTP code
export const validateTOTP = (code: string, secret: string) => {
  try {
    const totp = new otpauth.TOTP({
      issuer: 'WillTank',
      label: 'User',
      secret: otpauth.Secret.fromBase32(secret),
      digits: 6,
      period: 30
    });
    
    // Verify the TOTP code
    const delta = totp.validate({ token: code, window: 1 });
    
    // Return true if the code is valid
    return delta !== null;
  } catch (error) {
    console.error('Error validating TOTP:', error);
    return false;
  }
};

// Setup 2FA for the user
export const setup2FA = async (code: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return { success: false };
    }
    
    // Get the TOTP secret
    const { secret } = await generateTOTPSecret();
    
    // Validate the code against the secret
    const isValid = validateTOTP(code, secret);
    
    if (!isValid) {
      console.error('Invalid TOTP code');
      return { success: false };
    }
    
    // Update the user security record
    const { data, error } = await supabase
      .from('user_security')
      .update({ 
        google_auth_secret: secret,
        google_auth_enabled: true
      })
      .eq('user_id', user.id)
      .select();
    
    if (error) {
      console.error('Error updating user security:', error);
      return { success: false };
    }
    
    // Generate recovery codes
    const recoveryCodes = Array.from({ length: 8 }, () => generateRecoveryCode());
    
    // Insert recovery codes into the database
    const { error: recoveryError } = await supabase
      .from('user_recovery_codes')
      .insert(recoveryCodes.map(code => ({
        user_id: user.id,
        code,
        used: false
      })));
    
    if (recoveryError) {
      console.error('Error creating recovery codes:', recoveryError);
      // Even if recovery codes fail, 2FA is enabled
      return { success: true, recoveryCodes: [] };
    }
    
    return { success: true, recoveryCodes };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return { success: false };
  }
};

// Disable 2FA for the user
export const disable2FA = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }
    
    // Update the user security record
    const { error } = await supabase
      .from('user_security')
      .update({ 
        google_auth_enabled: false 
      })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return false;
  }
};

// Helper function to generate a random string
const generateRandomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to generate a recovery code
const generateRecoveryCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const segments = Array.from({ length: 4 }, () => {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  });
  
  return segments.join('-');
};
