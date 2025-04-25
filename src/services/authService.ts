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
    const { data, error: userError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (userError) {
      throw userError;
    }

    // Send verification email
    await sendVerificationEmail({ email, isLogin: true });

    return { data: data.user, error: null };
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
    const response = await supabase.functions.invoke('verify-email', {
      body: { email, name, isLogin }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Error sending verification email');
    }

    return { data: response.data, error: null };
  } catch (error: any) {
    console.error('Send verification email error:', error);
    return { data: null, error: error.message };
  }
};

export const verifyCode = async ({ email, code, isLogin }: VerifyCodeData) => {
  try {
    // Get the current origin for proper redirection
    const origin = window.location.origin;
    console.log("Current origin for verification:", origin);
    
    const response = await supabase.functions.invoke('verify-code', {
      body: { email, code, isLogin, origin }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Error verifying code');
    }

    // Stop any automatic redirects - we want to handle this manually
    if (response.data?.authLink) {
      console.log("Received auth link:", response.data.authLink);
      
      // If the auth link is a full URL with our origin, extract the token
      if (response.data.authLink.includes('#access_token=')) {
        // Extract the hash part and store it for the Supabase client to use
        const hashPart = response.data.authLink.substring(response.data.authLink.indexOf('#'));
        sessionStorage.setItem('supabase.auth.token', hashPart);
        
        // Don't navigate - let the app handle it based on the token
        console.log("Stored auth token for processing, will NOT redirect automatically");
      } 
      // Otherwise, we'll use the link directly but prevent automatic navigation
      else {
        console.log("Will NOT redirect automatically - letting the app handle it");
      }
    }

    return { data: response.data, error: null };
  } catch (error: any) {
    console.error('Verify code error:', error);
    return { data: null, error: error.message };
  }
};

export const logUserActivity = async (activityType: string, details?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.functions.invoke('log-activity', {
      body: {
        userId: user?.id,
        activityType,
        details
      }
    });
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
