
import { supabase } from "@/integrations/supabase/client";
import * as OTPAuth from "otpauth";

/**
 * Interface for User Security data
 */
export interface UserSecurity {
  id: string;
  user_id: string;
  encryption_key: string;
  google_auth_enabled: boolean;
  google_auth_secret: string | null;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

/**
 * Interface for Encryption Key
 */
export interface EncryptionKey {
  id: string;
  user_id: string;
  name: string;
  type: string;
  algorithm: string;
  strength: string;
  key_material: string; // This maps to 'value' in the database
  status: string;
  created_at: string;
  updated_at?: string; // Make this optional since it might not be in the database
  last_used: string | null;
}

/**
 * Interface for database Encryption Key (what comes back from Supabase)
 */
interface DBEncryptionKey {
  id: string;
  user_id: string;
  name: string;
  type: string;
  algorithm: string;
  strength: string;
  value: string; // This is 'key_material' in our interface
  status: string;
  created_at: string;
  last_used: string | null;
}

/**
 * Interface for Recovery Code
 */
export interface RecoveryCode {
  id: string;
  user_id: string;
  code: string;
  used: boolean;
  created_at: string;
  used_at: string | null;
}

/**
 * Validates a TOTP code against a secret
 * @param token The TOTP code to validate
 * @param secret The secret key
 * @returns True if valid, false otherwise
 */
export function validateTOTP(token: string, secret: string): boolean {
  if (!token || !secret) {
    console.error('TOTP validation failed: token or secret is missing');
    return false;
  }
  
  try {
    // Clean up the secret (remove spaces) and token
    const cleanSecret = secret.replace(/\s+/g, '');
    const cleanToken = token.replace(/\s+/g, '');
    
    if (cleanToken.length !== 6) {
      console.error('TOTP token must be 6 digits');
      return false;
    }
    
    // Create a TOTP object with the same parameters as when generating
    const totp = new OTPAuth.TOTP({
      issuer: 'WillTank',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cleanSecret)
    });
    
    // Use a larger window to allow for time drift (±1 minute)
    const result = totp.validate({ token: cleanToken, window: 2 });
    console.log('TOTP validation result:', result !== null ? 'Valid' : 'Invalid');
    
    // If result is null, the token is invalid
    return result !== null;
  } catch (error) {
    console.error('Error validating TOTP:', error);
    return false;
  }
}

/**
 * Generates a new TOTP secret and QR code URL
 * @returns Object containing the secret and QR code URL
 */
export async function generateTOTPSecret(): Promise<{ secret: string; qrCodeUrl: string }> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Generate a secure random string for the secret
    const secret = generateSecureBase32(20); // 20 bytes = 160 bits (recommended for TOTP)
    
    // Create a new TOTP object
    const totp = new OTPAuth.TOTP({
      issuer: 'WillTank',
      label: user.email || 'user',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });
    
    // Generate the QR code URL
    const qrCodeUrl = totp.toString();
    
    console.log('Generated new TOTP secret:', secret);
    
    return {
      secret,
      qrCodeUrl
    };
  } catch (error) {
    console.error('Error generating TOTP secret:', error);
    throw error;
  }
}

/**
 * Generates a secure random Base32 string
 * @param byteLength Length in bytes of the random data
 * @returns Base32 encoded string
 */
function generateSecureBase32(byteLength: number = 20): string {
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);
  
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < randomBytes.length; i++) {
    value = (value << 8) | randomBytes[i];
    bits += 8;
    
    while (bits >= 5) {
      result += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    result += ALPHABET[(value << (5 - bits)) & 31];
  }
  
  // Format the secret with spaces for readability (every 4 characters)
  return result.match(/.{1,4}/g)?.join(' ') || result;
}

/**
 * Sets up two-factor authentication for the current user
 * @param verificationCode The verification code entered by the user
 * @returns Object with success status and recovery codes
 */
export async function setup2FA(verificationCode: string): Promise<{ success: boolean; recoveryCodes?: string[] }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Get or create user security record
    let security = await getUserSecurity();
    
    if (!security) {
      security = await createUserSecurity();
      if (!security) {
        throw new Error('Failed to create security record');
      }
    }
    
    // Generate a new TOTP secret if one doesn't exist
    if (!security.google_auth_secret) {
      const { secret } = await generateTOTPSecret();
      security.google_auth_secret = secret;
    }
    
    // Validate the verification code
    const isValid = validateTOTP(verificationCode, security.google_auth_secret);
    
    if (!isValid) {
      throw new Error('Invalid verification code');
    }
    
    // Update the user's security record
    const { error } = await supabase
      .from('user_security')
      .update({
        google_auth_enabled: true,
        google_auth_secret: security.google_auth_secret,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error updating user security record:', error);
      throw error;
    }
    
    // Generate recovery codes
    const recoveryCodes = await generateRecoveryCodes(user.id);
    
    return {
      success: true,
      recoveryCodes
    };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return { success: false };
  }
}

/**
 * Disables two-factor authentication for the current user
 * @returns True if successful, false otherwise
 */
export async function disable2FA(): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Update the user's security record
    const { error } = await supabase
      .from('user_security')
      .update({
        google_auth_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return false;
  }
}

/**
 * Gets the security information for the current user
 * @returns UserSecurity object or null if not found
 */
export async function getUserSecurity(): Promise<UserSecurity | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }
    
    console.log('Getting security info for user:', user.id);
    
    // Get user's security record
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting user security:', error);
      return null;
    }
    
    console.log('User security record:', data);
    return data as UserSecurity;
  } catch (error) {
    console.error('Error getting user security:', error);
    return null;
  }
}

/**
 * Creates a new security record for the current user
 * @returns UserSecurity object or null if creation failed
 */
export async function createUserSecurity(): Promise<UserSecurity | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    console.log('Creating security record for user:', user.id);
    
    // Create encryption key for user
    const encryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    // Create new security record
    const { data, error } = await supabase
      .from('user_security')
      .insert({
        user_id: user.id,
        encryption_key: encryptionKey,
        google_auth_enabled: false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user security:', error);
      throw error;
    }
    
    console.log('Successfully created security record:', data);
    return data as UserSecurity;
  } catch (error) {
    console.error('Error creating user security:', error);
    return null;
  }
}

/**
 * Generates recovery codes for the current user
 * @param userId User ID to generate codes for
 * @param count Number of codes to generate (default: 10)
 * @returns Array of recovery codes
 */
export async function generateRecoveryCodes(userId: string, count: number = 10): Promise<string[]> {
  try {
    // Delete any existing recovery codes
    await supabase
      .from('user_recovery_codes')
      .delete()
      .eq('user_id', userId);
      
    const codes: string[] = [];
    
    // Generate the specified number of unique recovery codes
    for (let i = 0; i < count; i++) {
      const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
        
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    
    // Store the codes in the database
    const recoveryCodesData = codes.map(code => ({
      user_id: userId,
      code,
      used: false
    }));
    
    const { error } = await supabase
      .from('user_recovery_codes')
      .insert(recoveryCodesData);
      
    if (error) {
      console.error('Error storing recovery codes:', error);
      throw error;
    }
    
    return codes;
  } catch (error) {
    console.error('Error generating recovery codes:', error);
    throw error;
  }
}

/**
 * Gets recovery codes for the current user
 * @param userId User ID to get codes for
 * @returns Array of recovery codes
 */
export async function getUserRecoveryCodes(userId: string): Promise<RecoveryCode[]> {
  try {
    // Get recovery codes for the user
    const { data, error } = await supabase
      .from('user_recovery_codes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting recovery codes:', error);
      throw error;
    }
    
    return data as RecoveryCode[];
  } catch (error) {
    console.error('Error getting recovery codes:', error);
    return [];
  }
}

/**
 * Validates a recovery code
 * @param userId User ID to validate code for
 * @param code Recovery code to validate
 * @returns True if valid, false otherwise
 */
export async function validateRecoveryCode(userId: string, code: string): Promise<boolean> {
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
      throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating recovery code:', error);
    return false;
  }
}

/**
 * Generates a new encryption key
 * @param name Key name
 * @param type Key type
 * @param algorithm Key algorithm
 * @param strength Key strength
 * @returns EncryptionKey object or null if creation failed
 */
export async function generateEncryptionKey(
  name: string,
  type: string = 'symmetric',
  algorithm: string = 'AES',
  strength: string = '256'
): Promise<EncryptionKey | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Generate a random key based on the strength
    const byteLength = parseInt(strength) / 8;
    const keyValue = Array.from(crypto.getRandomValues(new Uint8Array(byteLength)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    // Create the encryption key record
    const { data, error } = await supabase
      .from('encryption_keys')
      .insert({
        user_id: user.id,
        name,
        type,
        algorithm,
        strength,
        value: keyValue,
        status: 'active'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error generating encryption key:', error);
      throw error;
    }

    // Convert the database response to our interface format
    const dbKey = data as DBEncryptionKey;
    const encryptionKey: EncryptionKey = {
      ...dbKey,
      key_material: dbKey.value,
      updated_at: dbKey.created_at // Use created_at as updated_at since it's not in the DB
    };
    
    return encryptionKey;
  } catch (error) {
    console.error('Error generating encryption key:', error);
    return null;
  }
}

/**
 * Gets encryption keys for the current user
 * @returns Array of EncryptionKey objects
 */
export async function getUserEncryptionKeys(): Promise<EncryptionKey[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Get encryption keys for the user
    const { data, error } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting encryption keys:', error);
      throw error;
    }

    // Convert the database response to our interface format
    const encryptionKeys: EncryptionKey[] = (data as DBEncryptionKey[]).map(dbKey => ({
      ...dbKey,
      key_material: dbKey.value,
      updated_at: dbKey.created_at // Use created_at as updated_at since it's not in the DB
    }));
    
    return encryptionKeys;
  } catch (error) {
    console.error('Error getting encryption keys:', error);
    return [];
  }
}

/**
 * Updates the status of an encryption key
 * @param keyId Key ID to update
 * @param status New status
 * @returns True if successful, false otherwise
 */
export async function updateEncryptionKeyStatus(keyId: string, status: string): Promise<boolean> {
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
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating encryption key status:', error);
    return false;
  }
}

