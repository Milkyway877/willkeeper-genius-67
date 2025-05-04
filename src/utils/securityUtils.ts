
import { supabase } from '@/integrations/supabase/client';

/**
 * Record a failed login attempt for security monitoring
 */
export const recordFailedLoginAttempt = async (email: string): Promise<{
  failedAttempts: number;
  isLocked: boolean;
  lockoutEnd?: Date;
}> => {
  try {
    // First, try to find the user by email
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (!userProfile?.id) {
      // We don't want to reveal if an email exists or not for security reasons
      // So we'll return a generic response for non-existent users
      return { failedAttempts: 1, isLocked: false };
    }
    
    // Check for existing security record
    const { data: securityRecord } = await supabase
      .from('user_security')
      .select('id, user_id, failed_login_attempts, last_failed_login')
      .eq('user_id', userProfile.id)
      .single();
    
    if (securityRecord) {
      // Increment failed attempts
      const newFailedAttempts = (securityRecord.failed_login_attempts || 0) + 1;
      const now = new Date().toISOString();
      
      // Update the record
      await supabase
        .from('user_security')
        .update({
          failed_login_attempts: newFailedAttempts,
          last_failed_login: now
        })
        .eq('id', securityRecord.id);
      
      // Determine if the account should be locked
      const isLocked = newFailedAttempts >= 5;
      const lockoutEnd = isLocked ? new Date(Date.now() + 15 * 60 * 1000) : undefined; // 15 minute lockout
      
      return {
        failedAttempts: newFailedAttempts,
        isLocked,
        lockoutEnd
      };
    } else {
      // Create new security record with first failed attempt
      const { data: newRecord } = await supabase
        .from('user_security')
        .insert({
          user_id: userProfile.id,
          failed_login_attempts: 1,
          last_failed_login: new Date().toISOString()
        })
        .select()
        .single();
      
      return {
        failedAttempts: 1,
        isLocked: false
      };
    }
  } catch (error) {
    console.error("Error recording failed login attempt:", error);
    return {
      failedAttempts: 1,
      isLocked: false
    };
  }
};

/**
 * Check if user account is locked due to too many failed login attempts
 */
export const checkAccountLockStatus = async (email: string): Promise<{
  isLocked: boolean;
  lockoutEnd?: Date;
  remainingAttempts: number;
}> => {
  try {
    // Find the user by email
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (!userProfile?.id) {
      // Don't reveal if email exists
      return { isLocked: false, remainingAttempts: 5 };
    }
    
    // Check security record
    const { data: securityRecord } = await supabase
      .from('user_security')
      .select('failed_login_attempts, last_failed_login')
      .eq('user_id', userProfile.id)
      .single();
    
    if (!securityRecord) {
      return { isLocked: false, remainingAttempts: 5 };
    }
    
    const failedAttempts = securityRecord.failed_login_attempts || 0;
    
    // If 5 or more failed attempts
    if (failedAttempts >= 5) {
      // Check if the last failed attempt was more than 15 minutes ago
      const lastFailedLogin = new Date(securityRecord.last_failed_login || new Date());
      const lockoutPeriod = 15 * 60 * 1000; // 15 minutes in milliseconds
      const now = new Date();
      
      // If still in the lockout period
      if ((now.getTime() - lastFailedLogin.getTime()) < lockoutPeriod) {
        const lockoutEnd = new Date(lastFailedLogin.getTime() + lockoutPeriod);
        return {
          isLocked: true,
          lockoutEnd,
          remainingAttempts: 0
        };
      } else {
        // Lockout period has expired, reset the failed attempts
        await supabase
          .from('user_security')
          .update({ failed_login_attempts: 0 })
          .eq('user_id', userProfile.id);
          
        return {
          isLocked: false,
          remainingAttempts: 5
        };
      }
    }
    
    return {
      isLocked: false,
      remainingAttempts: 5 - failedAttempts
    };
    
  } catch (error) {
    console.error("Error checking account lock status:", error);
    return {
      isLocked: false,
      remainingAttempts: 5
    };
  }
};

/**
 * Reset failed login attempts after successful login
 */
export const resetFailedLoginAttempts = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('user_security')
      .update({ failed_login_attempts: 0 })
      .eq('user_id', userId);
  } catch (error) {
    console.error("Error resetting failed login attempts:", error);
  }
};
