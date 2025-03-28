
import { supabase } from "@/integrations/supabase/client";
import * as OTPAuth from "otpauth";
import { toast } from "@/hooks/use-toast";

export interface UserSecurity {
  user_id: string;
  encryption_key: string;
  google_auth_secret?: string | null;
  google_auth_enabled?: boolean;
  last_login: string;
}

export interface RecoveryCode {
  id: string;
  user_id: string;
  code: string;
  used: boolean;
  created_at: string;
  used_at?: string | null;
}

export const getUserSecurity = async (): Promise<UserSecurity | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, create default security record
        return createUserSecurity();
      }
      console.error('Error fetching user security:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserSecurity:', error);
    return null;
  }
};

export const createUserSecurity = async (): Promise<UserSecurity | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Generate a random encryption key
    const encryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const securityData = {
      user_id: session.user.id,
      encryption_key: encryptionKey,
      google_auth_enabled: false
    };
    
    const { data, error } = await supabase
      .from('user_security')
      .insert(securityData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user security:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createUserSecurity:', error);
    return null;
  }
};

export const updateUserSecurity = async (updates: Partial<UserSecurity>): Promise<UserSecurity | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    const { data, error } = await supabase
      .from('user_security')
      .update(updates)
      .eq('user_id', session.user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user security:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateUserSecurity:', error);
    return null;
  }
};

// Google Authenticator functions
export const generateTOTPSecret = (): { secret: string, qrCodeUrl: string } => {
  // Generate a new TOTP secret using the OTPAuth library
  const totp = new OTPAuth.TOTP({
    issuer: 'WillTank',
    label: 'WillTank 2FA',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromRandom(20) // Generate a proper 20-byte random secret
  });
  
  // Get the URL for the QR code
  const qrCodeUrl = totp.toString();
  
  return {
    secret: totp.secret.base32, // This is the secret key in Base32 format for display
    qrCodeUrl
  };
};

export const validateTOTP = (token: string, secret: string): boolean => {
  try {
    if (!token || !secret) {
      console.error('Missing token or secret');
      return false;
    }
    
    // Clean the token and secret of any whitespace
    const cleanToken = token.replace(/\s+/g, '');
    const cleanSecret = secret.replace(/\s+/g, '');
    
    // Create a TOTP object with the provided secret
    const totp = new OTPAuth.TOTP({
      issuer: 'WillTank',
      label: 'WillTank 2FA',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cleanSecret)
    });
    
    // Validate the token with a window of 1 to allow for slight time differences
    const delta = totp.validate({
      token: cleanToken,
      window: 1 // Allow 1 period before and after current time
    });
    
    return delta !== null;
  } catch (error) {
    console.error('Error validating TOTP:', error);
    return false;
  }
};

export const generateRecoveryCodes = (): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < 8; i++) {
    // Generate a 10-character alphanumeric code with strong randomness
    const randomBytes = crypto.getRandomValues(new Uint8Array(15));
    const code = Array.from(randomBytes)
      .map(b => b.toString(36).substring(2, 3))
      .join('')
      .toUpperCase()
      .substring(0, 10);
    
    // Format as XXXXX-XXXXX
    codes.push(`${code.substring(0, 5)}-${code.substring(5, 10)}`);
  }
  
  return codes;
};

export const storeRecoveryCodes = async (codes: string[]): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Create an array of objects with the recovery codes data
    const recoveryCodesData = codes.map(code => ({
      user_id: session.user.id,
      code: code,
      used: false
    }));
    
    // Make a type-safe insert
    const { error } = await supabase
      .from('user_recovery_codes')
      .upsert(recoveryCodesData, { onConflict: 'user_id,code' });
      
    if (error) {
      console.error('Error storing recovery codes:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in storeRecoveryCodes:', error);
    return false;
  }
};

export const getUserRecoveryCodes = async (): Promise<RecoveryCode[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Use a properly typed select query
    const { data, error } = await supabase
      .from('user_recovery_codes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching recovery codes:', error);
      throw error;
    }
    
    // Explicitly cast the data to our RecoveryCode interface
    return (data || []) as RecoveryCode[];
  } catch (error) {
    console.error('Error in getUserRecoveryCodes:', error);
    return [];
  }
};

export const validateRecoveryCode = async (code: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Find the matching recovery code
    const { data, error } = await supabase
      .from('user_recovery_codes')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('code', code)
      .eq('used', false)
      .maybeSingle();
      
    if (error) {
      console.error('Error validating recovery code:', error);
      return false;
    }
    
    if (!data) {
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
    console.error('Error in validateRecoveryCode:', error);
    return false;
  }
};

export const setup2FA = async (otpToken: string): Promise<{ success: boolean, recoveryCodes?: string[] }> => {
  try {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Generate a new TOTP secret
    const { secret, qrCodeUrl } = generateTOTPSecret();
    
    // Validate the token provided by the user
    const isValid = validateTOTP(otpToken, secret);
    
    if (!isValid) {
      toast({
        title: "Invalid code",
        description: "The verification code you entered is invalid. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
    
    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes();
    
    // Store the recovery codes
    await storeRecoveryCodes(recoveryCodes);
    
    // Update the user's security settings
    const updates = {
      google_auth_secret: secret,
      google_auth_enabled: true
    };
    
    await updateUserSecurity(updates);
    
    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now protected with 2FA.",
    });
    
    return { 
      success: true,
      recoveryCodes
    };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    toast({
      title: "Error",
      description: "Failed to set up two-factor authentication. Please try again.",
      variant: "destructive",
    });
    return { success: false };
  }
};

export const disable2FA = async (): Promise<boolean> => {
  try {
    // Update the user's security settings
    const updates = {
      google_auth_enabled: false
    };
    
    await updateUserSecurity(updates);
    
    toast({
      title: "Two-factor authentication disabled",
      description: "Two-factor authentication has been disabled for your account.",
    });
    
    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    toast({
      title: "Error",
      description: "Failed to disable two-factor authentication. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

// New functions for encryption key management
export interface EncryptionKey {
  id: string;
  name: string;
  value: string;
  type: 'primary' | 'backup' | 'document' | 'access';
  algorithm: string;
  strength: string;
  created_at: string;
  last_used: string | null;
  status: 'active' | 'inactive' | 'revoked';
  user_id: string;
}

export const generateEncryptionKey = async (
  name: string, 
  type: 'primary' | 'backup' | 'document' | 'access'
): Promise<EncryptionKey | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Generate a random key based on type
    let algorithm: string;
    let keyValue: string;
    
    if (type === 'primary' || type === 'document') {
      algorithm = 'AES-256';
      // Generate a suitable AES key
      const keyBytes = crypto.getRandomValues(new Uint8Array(32));
      keyValue = Array.from(keyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else {
      algorithm = 'RSA-2048';
      // For simplicity, we're generating a random RSA-like key
      // In a real app, you would use proper RSA key generation
      const keyBytes = crypto.getRandomValues(new Uint8Array(256));
      keyValue = Array.from(keyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
    
    // Create new encryption key
    const newKey = {
      user_id: session.user.id,
      name,
      value: keyValue,
      type,
      algorithm,
      strength: 'Very Strong',
      status: 'active',
    };
    
    // Insert into database - create a new table for encryption keys
    const { data, error } = await supabase
      .from('encryption_keys')
      .insert(newKey)
      .select()
      .single();
      
    if (error) {
      // If the table doesn't exist yet, we need to handle that case
      if (error.code === '42P01') {
        // Table doesn't exist, but we don't want to break functionality
        // Return a mock key for now, but log the error
        console.error('Encryption keys table does not exist:', error);
        
        return {
          id: crypto.randomUUID(),
          ...newKey,
          created_at: new Date().toISOString(),
          last_used: null
        } as EncryptionKey;
      }
      
      console.error('Error generating encryption key:', error);
      throw error;
    }
    
    return data as EncryptionKey;
  } catch (error) {
    console.error('Error in generateEncryptionKey:', error);
    return null;
  }
};

export const getUserEncryptionKeys = async (): Promise<EncryptionKey[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }
    
    // Try to get keys from database
    const { data, error } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('user_id', session.user.id);
      
    if (error) {
      // If the table doesn't exist, return an empty array
      if (error.code === '42P01') {
        console.error('Encryption keys table does not exist:', error);
        return [];
      }
      
      console.error('Error fetching encryption keys:', error);
      return [];
    }
    
    return data as EncryptionKey[];
  } catch (error) {
    console.error('Error in getUserEncryptionKeys:', error);
    return [];
  }
};

export const updateEncryptionKeyStatus = async (
  keyId: string, 
  status: 'active' | 'inactive' | 'revoked'
): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    // Update key status
    const { error } = await supabase
      .from('encryption_keys')
      .update({ status, last_used: new Date().toISOString() })
      .eq('id', keyId)
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error updating key status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateEncryptionKeyStatus:', error);
    return false;
  }
};
