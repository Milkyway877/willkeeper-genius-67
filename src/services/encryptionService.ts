
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
  // Generate a new TOTP secret
  const secret = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Create a token object
  const totp = new OTPAuth.TOTP({
    issuer: 'WillTank',
    label: 'WillTank 2FA',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromHex(secret)
  });
  
  // Get the URL for the QR code
  const qrCodeUrl = totp.toString();
  
  return {
    secret: totp.secret.base32,
    qrCodeUrl
  };
};

export const validateTOTP = (token: string, secret: string): boolean => {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: 'WillTank',
      label: 'WillTank 2FA',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });
    
    // Validate the token
    const delta = totp.validate({
      token,
      window: 1  // Allow 1 period before and after current time
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
    // Generate a 10-character alphanumeric code
    const code = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map(b => b.toString(36).substring(2, 3))
      .join('')
      .toUpperCase();
    
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
    
    // Store the hashed recovery codes in the database
    // In a real implementation, you would hash these codes
    const { error } = await supabase
      .from('user_recovery_codes')
      .upsert(
        codes.map(code => ({
          user_id: session.user.id,
          code: code,
          used: false
        })),
        { onConflict: 'user_id,code' }
      );
      
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
