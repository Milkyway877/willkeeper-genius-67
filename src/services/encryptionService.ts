
// Fix the OTPAuth import
import * as OTPAuth from 'otpauth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// RecoveryCode interface
export interface RecoveryCode {
  id: string;
  user_id: string;
  code: string;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

// EncryptionKey interface
export interface EncryptionKey {
  id: string;
  user_id: string;
  name: string;
  value: string;
  type: string;
  algorithm: string;
  strength: string | null;
  status: string;
  created_at: string;
  last_used: string | null;
}

// User security interface
export interface UserSecurity {
  user_id: string;
  google_auth_enabled: boolean;
  google_auth_secret: string | null;
  encryption_key: string;
  last_login: string | null;
}

/**
 * Generates a TOTP URI for use with authenticator apps
 * @param secret The secret key for TOTP generation
 * @param account The user account name
 * @param issuer The application name
 * @returns The TOTP URI
 */
export function generateTOTPUri(secret: string, account: string, issuer: string = 'WillTank'): string {
  const totp = new OTPAuth.TOTP({
    issuer,
    label: account,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret.replace(/\s+/g, ''))
  });
  
  return totp.toString();
}

/**
 * Generates a random TOTP secret key
 * @returns A formatted TOTP secret key
 */
export function generateTOTPSecret(): { secret: string; qrCodeUrl: string } {
  // Generate a random secret key of 20 bytes (160 bits)
  const secret = OTPAuth.Secret.random(20);
  const base32Secret = secret.base32;
  
  // Format the secret in groups of 4 characters for better readability
  const formattedSecret = base32Secret.match(/.{1,4}/g)?.join(' ') || base32Secret;
  
  // Get the current user for the QR code
  const user = supabase.auth.getUser();
  const account = 'user@example.com'; // Default fallback
  
  // Generate the QR code URL
  const qrCodeUrl = generateTOTPUri(formattedSecret, account);
  
  return { 
    secret: formattedSecret,
    qrCodeUrl
  };
}

/**
 * Validates a TOTP code against a secret
 * @param token The TOTP code to validate
 * @param secret The secret key
 * @returns True if valid, false otherwise
 */
export function validateTOTP(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  
  try {
    // Clean up the secret (remove spaces)
    const cleanSecret = secret.replace(/\s+/g, '');
    
    // Create a TOTP object with the same parameters as when generating
    const totp = new OTPAuth.TOTP({
      issuer: 'WillTank',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cleanSecret)
    });
    
    // Delta of 1 allows for a bit of time drift (±30 seconds)
    const result = totp.validate({ token, window: 1 });
    
    // If result is null, the token is invalid
    return result !== null;
  } catch (error) {
    console.error('Error validating TOTP:', error);
    return false;
  }
}

/**
 * Generates recovery codes for a user
 * @param userId The user ID
 * @param numberOfCodes The number of recovery codes to generate
 * @returns An array of recovery codes
 */
export async function generateRecoveryCodes(userId: string, numberOfCodes: number = 10): Promise<string[]> {
  try {
    // Generate random recovery codes
    const codes: string[] = [];
    for (let i = 0; i < numberOfCodes; i++) {
      // Format: XXXX-XXXX-XXXX where X is an alphanumeric character
      const code = Array.from({ length: 3 }, () => 
        Array.from({ length: 4 }, () => 
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]
        ).join('')
      ).join('-');
      
      codes.push(code);
    }
    
    // Store the codes in the database
    const insertPromises = codes.map(code => 
      supabase.from('user_recovery_codes').insert({
        user_id: userId,
        code: code,
        used: false
      })
    );
    
    await Promise.all(insertPromises);
    
    return codes;
  } catch (error) {
    console.error('Error generating recovery codes:', error);
    throw error;
  }
}

/**
 * Retrieves unused recovery codes for a user
 * @param userId The user ID
 * @returns An array of unused recovery codes
 */
export async function getUserRecoveryCodes(userId: string): Promise<RecoveryCode[]> {
  try {
    const { data, error } = await supabase
      .from('user_recovery_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('used', false);
      
    if (error) throw error;
    
    return data as RecoveryCode[];
  } catch (error) {
    console.error('Error getting recovery codes:', error);
    return [];
  }
}

/**
 * Validates a recovery code for a user
 * @param userId The user ID
 * @param code The recovery code to validate
 * @returns True if valid, false otherwise
 */
export async function validateRecoveryCode(userId: string, code: string): Promise<boolean> {
  try {
    // Find the recovery code
    const { data, error } = await supabase
      .from('user_recovery_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .eq('used', false)
      .maybeSingle();
      
    if (error || !data) return false;
    
    // Mark the code as used
    const { error: updateError } = await supabase
      .from('user_recovery_codes')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', (data as RecoveryCode).id);
      
    if (updateError) {
      console.error('Error marking recovery code as used:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating recovery code:', error);
    return false;
  }
}

/**
 * Creates new user security settings
 * @returns New user security settings
 */
export async function createUserSecurity(): Promise<UserSecurity | null> {
  try {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create security settings",
        variant: "destructive"
      });
      return null;
    }

    // Generate an encryption key
    const keyBytes = new Uint8Array(32); // 256 bits
    crypto.getRandomValues(keyBytes);
    
    // Convert to a hex string for storage
    const encryptionKey = Array.from(keyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Store in user_security table
    const { data, error } = await supabase
      .from('user_security')
      .insert({
        user_id: user.id,
        encryption_key: encryptionKey,
        google_auth_enabled: false
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user security:', error);
      toast({
        title: "Error creating security settings",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    return data as UserSecurity;
  } catch (error) {
    console.error('Error creating user security:', error);
    return null;
  }
}

/**
 * Gets the security settings for the current user
 * @returns User security settings
 */
export async function getUserSecurity(): Promise<UserSecurity | null> {
  try {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Retrieve user security settings
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting user security:', error);
      return null;
    }
    
    return data as UserSecurity | null;
  } catch (error) {
    console.error('Error getting user security:', error);
    return null;
  }
}

/**
 * Sets up 2FA for a user
 * @param verificationCode The verification code from the authenticator app
 * @returns Success result and recovery codes
 */
export async function setup2FA(verificationCode: string): Promise<{ success: boolean, recoveryCodes?: string[] }> {
  try {
    // Get current user security settings
    const security = await getUserSecurity();
    if (!security) {
      throw new Error("User security settings not found");
    }
    
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Generate a new secret if one doesn't exist
    let secret = security.google_auth_secret;
    if (!secret) {
      const { secret: newSecret } = generateTOTPSecret();
      secret = newSecret;
    }
    
    // Validate the verification code
    const isValid = validateTOTP(verificationCode, secret);
    if (!isValid) {
      return { success: false };
    }
    
    // Update user security settings
    const { error } = await supabase
      .from('user_security')
      .update({
        google_auth_enabled: true,
        google_auth_secret: secret
      })
      .eq('user_id', user.id);
      
    if (error) {
      throw new Error(error.message);
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
 * Disables 2FA for a user
 * @returns Success boolean
 */
export async function disable2FA(): Promise<boolean> {
  try {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Update user security settings
    const { error } = await supabase
      .from('user_security')
      .update({
        google_auth_enabled: false
      })
      .eq('user_id', user.id);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return false;
  }
}

/**
 * Generates an encryption key
 * @param name Key name
 * @param type Key type
 * @param algorithm Encryption algorithm
 * @param strength Key strength
 * @returns A new encryption key object
 */
export async function generateEncryptionKey(
  name: string,
  type: string = 'symmetric',
  algorithm: string = 'AES',
  strength: string = '256'
): Promise<EncryptionKey | null> {
  try {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to generate encryption keys",
        variant: "destructive"
      });
      return null;
    }

    // Generate a cryptographically secure random key
    const keyBytes = new Uint8Array(32); // 256 bits
    crypto.getRandomValues(keyBytes);
    
    // Convert to a hex string for storage
    const keyValue = Array.from(keyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Store the key in the database
    const { data, error } = await supabase
      .from('encryption_keys')
      .insert({
        user_id: user.id,
        name: name,
        value: keyValue,
        type: type,
        algorithm: algorithm,
        strength: strength,
        status: 'active'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error storing encryption key:', error);
      toast({
        title: "Error generating key",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
    
    toast({
      title: "Encryption key generated",
      description: `Successfully created ${algorithm}-${strength} key: ${name}`
    });
    
    return data as EncryptionKey;
  } catch (error) {
    console.error('Error generating encryption key:', error);
    toast({
      title: "Error generating key",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

/**
 * Gets all encryption keys for the current user
 * @returns Array of encryption keys
 */
export async function getUserEncryptionKeys(): Promise<EncryptionKey[]> {
  try {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // Retrieve keys from the database
    const { data, error } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error retrieving encryption keys:', error);
      return [];
    }
    
    return data as EncryptionKey[];
  } catch (error) {
    console.error('Error getting encryption keys:', error);
    return [];
  }
}

/**
 * Updates the status of an encryption key
 * @param keyId The key ID
 * @param status The new status
 * @returns Success boolean
 */
export async function updateEncryptionKeyStatus(keyId: string, status: string): Promise<boolean> {
  try {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Update the key status
    const { error } = await supabase
      .from('encryption_keys')
      .update({ status: status, last_used: new Date().toISOString() })
      .eq('id', keyId)
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error updating encryption key status:', error);
      toast({
        title: "Error updating key",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Key updated",
      description: `Key status changed to: ${status}`
    });
    
    return true;
  } catch (error) {
    console.error('Error updating encryption key status:', error);
    return false;
  }
}
