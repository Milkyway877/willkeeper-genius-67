
import { supabase } from "@/integrations/supabase/client";
import * as otpauth from 'otpauth';

// Export interface for EncryptionKey
export interface EncryptionKey {
  id: string;
  user_id: string;
  name: string;
  type: string;
  algorithm: string;
  strength: string;
  key_material: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_used: string | null;
}

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

// Get user recovery codes
export const getUserRecoveryCodes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_recovery_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('used', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching recovery codes:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching recovery codes:', error);
    return [];
  }
};

// Generate new recovery codes for a user
export const generateRecoveryCodes = async (userId: string) => {
  try {
    // Delete existing recovery codes
    const { error: deleteError } = await supabase
      .from('user_recovery_codes')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error deleting existing recovery codes:', deleteError);
      return [];
    }
    
    // Generate new recovery codes
    const recoveryCodes = Array.from({ length: 8 }, () => generateRecoveryCode());
    
    // Insert new recovery codes
    const { data, error } = await supabase
      .from('user_recovery_codes')
      .insert(recoveryCodes.map(code => ({
        user_id: userId,
        code,
        used: false
      })))
      .select();
    
    if (error) {
      console.error('Error creating recovery codes:', error);
      return [];
    }
    
    return recoveryCodes;
  } catch (error) {
    console.error('Error generating recovery codes:', error);
    return [];
  }
};

// Validate a recovery code
export const validateRecoveryCode = async (userId: string, code: string) => {
  try {
    // Get the recovery code
    const { data, error } = await supabase
      .from('user_recovery_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .eq('used', false)
      .single();
    
    if (error || !data) {
      console.error('Error validating recovery code:', error);
      return false;
    }
    
    // Mark the code as used
    const { error: updateError } = await supabase
      .from('user_recovery_codes')
      .update({ 
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', data.id);
    
    if (updateError) {
      console.error('Error marking recovery code as used:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating recovery code:', error);
    return false;
  }
};

// Get user encryption keys
export const getUserEncryptionKeys = async (): Promise<EncryptionKey[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return [];
    }
    
    const { data, error } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching encryption keys:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching encryption keys:', error);
    return [];
  }
};

// Generate a new encryption key
export const generateEncryptionKey = async (
  name: string, 
  type: string, 
  algorithm: string, 
  strength: string
): Promise<EncryptionKey | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
    // Generate a random key material
    const keyMaterial = generateRandomString(Number(strength) / 8);
    
    const { data, error } = await supabase
      .from('encryption_keys')
      .insert([
        {
          user_id: user.id,
          name,
          type,
          algorithm,
          strength,
          key_material: keyMaterial,
          status: 'active'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating encryption key:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating encryption key:', error);
    return null;
  }
};

// Update encryption key status
export const updateEncryptionKeyStatus = async (keyId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('encryption_keys')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId);
    
    if (error) {
      console.error('Error updating encryption key status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating encryption key status:', error);
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
