
import { supabase } from '@/integrations/supabase/client';

export type AuthFlowType = 'signup' | 'login' | 'recovery';

export interface AuthErrorResponse {
  success: false;
  message: string;
  code?: string;
}

export interface AuthSuccessResponse {
  success: true;
  data?: any;
  message?: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

// Helper to store temporary credentials in session storage (cleared after verification)
export const storeTemporaryCredentials = (email: string, password?: string) => {
  sessionStorage.setItem('auth_email', email);
  if (password) {
    sessionStorage.setItem('auth_password', password);
  }
};

// Helper to clear temporary credentials
export const clearTemporaryCredentials = () => {
  sessionStorage.removeItem('auth_email');
  sessionStorage.removeItem('auth_password');
};

// Get temporary credentials
export const getTemporaryCredentials = () => {
  return {
    email: sessionStorage.getItem('auth_email') || '',
    password: sessionStorage.getItem('auth_password') || '',
  };
};

// Send verification code
export const sendVerificationCode = async (email: string, type: AuthFlowType): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('auth', {
      body: { action: 'send_code', email, type }
    });
    
    if (error) {
      console.error(`Error sending verification code:`, error);
      return { 
        success: false, 
        message: error.message || 'Failed to send verification code' 
      };
    }
    
    if (!data.success) {
      return { 
        success: false, 
        message: data.error || 'Failed to send verification code' 
      };
    }
    
    return { 
      success: true, 
      message: 'Verification code sent successfully' 
    };
  } catch (error) {
    console.error(`Error sending verification code:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Verify code
export const verifyCode = async (
  email: string, 
  code: string, 
  type: AuthFlowType
): Promise<AuthResponse> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Get device info for security audit
    const userAgent = navigator.userAgent;
    const deviceInfo = JSON.stringify({
      browser: /chrome|firefox|safari|edge|opera/i.exec(userAgent.toLowerCase())?.[0] || 'browser',
      os: /windows|mac|linux|android|ios/i.exec(userAgent.toLowerCase())?.[0] || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Verify the code
    const { data, error } = await supabase.functions.invoke('auth', {
      body: { 
        action: 'verify_code', 
        email, 
        code, 
        type,
        userId,
        deviceInfo
      }
    });
    
    if (error) {
      console.error(`Error verifying code:`, error);
      return { 
        success: false, 
        message: error.message || 'Failed to verify code' 
      };
    }
    
    if (!data.success) {
      return { 
        success: false, 
        message: data.message || 'Invalid verification code' 
      };
    }
    
    // Mark session as just verified to skip additional verification
    localStorage.setItem('session_just_verified', 'true');
    
    return { 
      success: true,
      message: 'Code verified successfully'
    };
  } catch (error) {
    console.error(`Error verifying code:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Sign up with email and password
export const signUp = async (email: string, password: string, metadata?: object): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      console.error(`Sign up error:`, error);
      return { 
        success: false, 
        message: error.message,
        code: error.code
      };
    }
    
    // Store credentials temporarily for use after verification
    storeTemporaryCredentials(email, password);
    
    return { 
      success: true,
      data: data.user,
      message: 'Signup successful. Please verify your email.'
    };
  } catch (error) {
    console.error(`Unexpected sign up error:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error(`Sign in error:`, error);
      return { 
        success: false, 
        message: error.message,
        code: error.code
      };
    }
    
    // Store email temporarily for use after verification
    storeTemporaryCredentials(email, password);
    
    // Check if user needs to verify their email
    const requiresEmailVerification = await checkRequiresEmailVerification(email);
    if (requiresEmailVerification) {
      // Send a verification code
      await sendVerificationCode(email, 'login');
      
      return { 
        success: true,
        data: { requiresEmailVerification: true },
        message: 'Please verify your email to continue'
      };
    }
    
    // Check if 2FA is required
    const requires2FA = await checkRequires2FA(data.user.id);
    if (requires2FA) {
      return { 
        success: true,
        data: { requires2FA: true },
        message: '2FA verification required'
      };
    }
    
    // All checks passed, user is fully authenticated
    localStorage.setItem('session_just_verified', 'true');
    
    return { 
      success: true,
      data: data.user,
      message: 'Sign in successful'
    };
  } catch (error) {
    console.error(`Unexpected sign in error:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) {
      console.error(`Reset password error:`, error);
      return { 
        success: false, 
        message: error.message,
        code: error.code
      };
    }
    
    return { 
      success: true,
      message: 'Password reset instructions sent to your email'
    };
  } catch (error) {
    console.error(`Unexpected reset password error:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Sign out
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error(`Sign out error:`, error);
      return { 
        success: false, 
        message: error.message,
        code: error.code
      };
    }
    
    // Clear any stored credentials and verification flags
    clearTemporaryCredentials();
    localStorage.removeItem('session_just_verified');
    
    return { 
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    console.error(`Unexpected sign out error:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// Check if user requires email verification
export const checkRequiresEmailVerification = async (email: string): Promise<boolean> => {
  try {
    // Skip verification if session was just verified
    const justVerified = localStorage.getItem('session_just_verified') === 'true';
    if (justVerified) {
      return false;
    }
    
    // Check for timestamp of last verification
    const { data } = await supabase
      .from('user_security')
      .select('last_verified')
      .eq('email', email)
      .single();
    
    if (!data || !data.last_verified) {
      // No verification record found, require verification
      return true;
    }
    
    // Check if verification is older than 24 hours
    const lastVerified = new Date(data.last_verified);
    const now = new Date();
    const hoursSinceVerification = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceVerification > 24;
  } catch (error) {
    console.error('Error checking email verification requirement:', error);
    // If error, require verification to be safe
    return true;
  }
};

// Check if 2FA is required
export const checkRequires2FA = async (userId: string): Promise<boolean> => {
  try {
    // Skip verification if session was just verified
    const justVerified = localStorage.getItem('session_just_verified') === 'true';
    if (justVerified) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('user_security')
      .select('two_factor_enabled')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return data.two_factor_enabled === true;
  } catch (error) {
    console.error('Error checking 2FA requirement:', error);
    return false;
  }
};

// Verify 2FA code
export const verify2FACode = async (
  code: string, 
  userId: string,
  email: string
): Promise<AuthResponse> => {
  try {
    // First get the user's 2FA secret
    const { data: securityData, error: securityError } = await supabase
      .from('user_security')
      .select('two_factor_secret')
      .eq('user_id', userId)
      .single();
    
    if (securityError || !securityData?.two_factor_secret) {
      console.error("Error fetching 2FA settings:", securityError);
      return {
        success: false,
        message: "Two-factor authentication is not properly set up for this account."
      };
    }
    
    // Validate 2FA code
    const { data, error } = await supabase.functions.invoke('two-factor', {
      body: { 
        action: 'validate',
        code,
        secret: securityData.two_factor_secret,
        userId,
        email
      }
    });
    
    if (error) {
      console.error("Error validating 2FA code:", error);
      return {
        success: false,
        message: "Failed to validate authentication code."
      };
    }
    
    if (!data?.success) {
      return {
        success: false,
        message: "Invalid authentication code. Please try again."
      };
    }
    
    // Mark session as verified
    localStorage.setItem('session_just_verified', 'true');
    
    return {
      success: true,
      message: "Two-factor authentication successful."
    };
  } catch (error) {
    console.error('Error during two-factor authentication:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};
