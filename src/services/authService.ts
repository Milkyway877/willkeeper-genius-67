
import { supabase } from "@/integrations/supabase/client";

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  name?: string;
  isLogin: boolean;
}

export interface VerifyCodeData {
  email: string;
  code: string;
  isLogin: boolean;
}

export const signUp = async ({ email, password, name }: SignupData) => {
  try {
    // Register the user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (authError) {
      throw authError;
    }

    // Send verification email
    await sendVerificationEmail({ email, name, isLogin: false });

    return { data: authData, error: null };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { data: null, error: error.message || 'An error occurred during signup' };
  }
};

export const login = async ({ email, password }: LoginData) => {
  try {
    // First check if email exists
    const { data: { user }, error: userError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (userError) {
      throw userError;
    }

    // Send verification email
    await sendVerificationEmail({ email, isLogin: true });

    return { data: user, error: null };
  } catch (error: any) {
    console.error('Login error:', error);
    return { data: null, error: error.message || 'An error occurred during login' };
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

export const sendVerificationEmail = async ({ email, name, isLogin }: VerifyEmailData) => {
  try {
    console.log(`Sending verification email to: ${email}, isLogin: ${isLogin}`);
    const response = await supabase.functions.invoke('verify-email', {
      body: { email, name, isLogin }
    });

    if (response.error) {
      console.error('Error response from verify-email function:', response.error);
      throw new Error(response.error.message || 'Error sending verification email');
    }

    console.log('Verification email sent successfully:', response.data);
    return { data: response.data, error: null };
  } catch (error: any) {
    console.error('Send verification email error:', error);
    return { data: null, error: error.message };
  }
};

export const verifyCode = async ({ email, code, isLogin }: VerifyCodeData) => {
  try {
    console.log(`Verifying code: ${code} for email: ${email}, isLogin: ${isLogin}`);
    const response = await supabase.functions.invoke('verify-code', {
      body: { email, code, isLogin }
    });

    if (response.error) {
      console.error('Error response from verify-code function:', response.error);
      throw new Error(response.error.message || 'Error verifying code');
    }

    console.log('Code verified successfully:', response.data);
    return { data: response.data, error: null };
  } catch (error: any) {
    console.error('Verify code error:', error);
    return { data: null, error: error.message };
  }
};

export const logUserActivity = async (activityType: string, details?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user found, not logging activity');
      return;
    }
    
    await supabase.functions.invoke('log-activity', {
      body: {
        userId: user?.id,
        activityType,
        details
      }
    });
    
    console.log(`Activity logged: ${activityType}`);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw, as this is not critical for the app
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }
    return { data: data.user, error: null };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return { data: null, error: error.message };
  }
};
