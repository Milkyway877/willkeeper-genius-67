
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
      .maybeSingle();
    
    if (error) {
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
    
    // Generate a new TOTP secret - use base32 encoding which is standard for TOTP
    const secret = generateRandomBase32(20);
    
    // Create a new TOTP object
    const totp = new otpauth.TOTP({
      issuer: 'WillTank',
      label: user.email || 'User',
      secret: otpauth.Secret.fromBase32(secret),
      digits: 6,
      period: 30,
      algorithm: 'SHA1' // TOTP standard algorithm
    });
    
    // Generate the Auth URI to use in a QR code
    const qrCodeUrl = totp.toString();
    
    console.log("Generated TOTP secret:", secret, "QR code URL:", qrCodeUrl);
    
    return { secret, qrCodeUrl };
  } catch (error) {
    console.error('Error generating TOTP secret:', error);
    return { secret: '', qrCodeUrl: '' };
  }
};

// Validate a TOTP code with improved error handling and debugging
export const validateTOTP = (code: string, secret: string) => {
  try {
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      console.error("Invalid code format:", code);
      return false;
    }
    
    if (!secret || secret.length < 16) {
      console.error("Invalid secret format:", secret);
      return false;
    }
    
    console.log("Validating TOTP code:", code, "with secret:", secret);
    
    // Clean up the secret - remove spaces and ensure proper base32 format
    const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
    
    const totp = new otpauth.TOTP({
      issuer: 'WillTank',
      label: 'User',
      secret: otpauth.Secret.fromBase32(cleanSecret),
      digits: 6,
      period: 30,
      algorithm: 'SHA1'
    });
    
    // Verify the TOTP code with a larger window to account for time drift
    // This will check the current and adjacent time windows (-1, 0, +1)
    const delta = totp.validate({
      token: code,
      window: 1
    });
    
    console.log("TOTP validation result:", delta !== null ? "Valid" : "Invalid");
    
    // Return true if the code is valid (delta will be non-null if valid)
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
    
    // Get existing security record or create one
    let securityRecord = await getUserSecurity();
    if (!securityRecord) {
      securityRecord = await createUserSecurity();
      if (!securityRecord) {
        console.error("Failed to create security record");
        return { success: false };
      }
    }
    
    // Generate a new TOTP secret if one doesn't exist
    let secret = securityRecord.google_auth_secret;
    if (!secret) {
      const { secret: newSecret } = await generateTOTPSecret();
      secret = newSecret;
    }
    
    // Validate the code against the secret
    const isValid = validateTOTP(code, secret);
    
    if (!isValid) {
      console.error('Invalid TOTP code');
      return { success: false, error: "Invalid verification code" };
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
      return { success: false, error: "Database error" };
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
    return { success: false, error: "Unexpected error" };
  }
};

// Disable 2FA for the user
export const disable2FA = async (code: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return { success: false, error: "User not found" };
    }
    
    // Get existing security record
    const securityRecord = await getUserSecurity();
    if (!securityRecord) {
      return { success: false, error: "Security record not found" };
    }
    
    // If 2FA is enabled, validate the code first
    if (securityRecord.google_auth_enabled && securityRecord.google_auth_secret) {
      const isValid = validateTOTP(code, securityRecord.google_auth_secret);
      
      if (!isValid) {
        console.error('Invalid TOTP code when disabling 2FA');
        return { success: false, error: "Invalid verification code" };
      }
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
      return { success: false, error: "Database error" };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return { success: false, error: "Unexpected error" };
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
    
    // Map database records to EncryptionKey interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name,
      type: item.type,
      algorithm: item.algorithm,
      strength: item.strength,
      key_material: item.value, // Map 'value' from DB to 'key_material' in interface
      status: item.status,
      created_at: item.created_at,
      updated_at: item.created_at, // Use created_at as updated_at if not available
      last_used: item.last_used
    }));
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
    
    // Insert record using the database column names
    const { data, error } = await supabase
      .from('encryption_keys')
      .insert({
        user_id: user.id,
        name,
        type,
        algorithm,
        strength,
        value: keyMaterial, // Use 'value' field for database
        status: 'active'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating encryption key:', error);
      return null;
    }
    
    // Map database record to EncryptionKey interface
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      type: data.type,
      algorithm: data.algorithm,
      strength: data.strength,
      key_material: data.value, // Map 'value' from DB to 'key_material' in interface
      status: data.status,
      created_at: data.created_at,
      updated_at: data.created_at, // Use created_at as updated_at
      last_used: data.last_used
    };
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
        // No need to update updated_at as it's likely handled by the database
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

// Helper function to generate a random base32 string (standard for TOTP)
const generateRandomBase32 = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Base32 character set
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
};

// Helper function to generate a random string
const generateRandomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
};

// Helper function to generate a recovery code
const generateRecoveryCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const segments = Array.from({ length: 4 }, () => {
    let segment = '';
    const randomValues = new Uint8Array(4);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(randomValues[i] % chars.length);
    }
    return segment;
  });
  
  return segments.join('-');
};
