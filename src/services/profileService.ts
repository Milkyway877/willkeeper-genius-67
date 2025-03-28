
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_activated: boolean | null;
  subscription_plan: string | null;
  activation_date: string | null;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    // Ensure the return data matches the UserProfile interface
    const profile: UserProfile = {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_activated: data.is_activated,
      subscription_plan: data.subscription_plan,
      activation_date: data.activation_date
    };
    
    return profile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    // Ensure the return data matches the UserProfile interface
    const profile: UserProfile = {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_activated: data.is_activated,
      subscription_plan: data.subscription_plan,
      activation_date: data.activation_date
    };
    
    return profile;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

export const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
