import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  activation_complete: boolean | null;
  created_at: string;
  updated_at: string;
  metadata?: {
    location?: string;
    bio?: string;
    preferences?: Record<string, any>;
    [key: string]: any;
  };
}

// Get the current user's profile
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

// Update the current user's profile
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userData.user.id)
      .select();

    if (error) throw error;

    return data[0] || null;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

// Update user preferences
export async function updateUserPreferences(updates: any): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Not authenticated');
    }

    // Check if preferences exist for this user
    const { data: existingPrefs, error: fetchError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userData.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Error other than "no rows returned"
      throw fetchError;
    }

    let result;
    if (existingPrefs) {
      // Update existing preferences
      result = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('id', existingPrefs.id);
    } else {
      // Create new preferences
      result = await supabase
        .from('user_preferences')
        .insert([{
          user_id: userData.user.id,
          ...updates
        }]);
    }

    if (result.error) throw result.error;

    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
}

// Get user preferences
export async function getUserPreferences(): Promise<any | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return empty object
        return {};
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

// Check if email exists
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_email_exists', {
      email_to_check: email
    });

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error('Error checking if email exists:', error);
    return false;
  }
}

// Get user security information
export async function getUserSecurity(): Promise<any | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_security')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No security info found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user security info:', error);
    return null;
  }
}
