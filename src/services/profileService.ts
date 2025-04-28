
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  gender?: 'male' | 'female';
  created_at: string;
  updated_at: string;
  is_activated: boolean | null;
  subscription_plan: string | null;
  activation_date: string | null;
  email_verified: boolean | null;
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
      is_activated: data.activation_complete, // Map from activation_complete to is_activated
      subscription_plan: data.subscription_plan || null, 
      activation_date: data.activation_date || null, 
      email: session.user.email, // Add email from the session
      email_verified: session.user.email_confirmed_at !== null, // Add email verification status
      gender: data.gender || undefined // Add gender field
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
    
    // Convert from UserProfile fields to database fields
    const dbUpdates: any = {...updates};
    
    // Map is_activated to activation_complete if it exists in the updates
    if (updates.is_activated !== undefined) {
      dbUpdates.activation_complete = updates.is_activated;
      delete dbUpdates.is_activated;
    }
    
    // Remove fields that don't exist in the database
    if (dbUpdates.activation_date !== undefined) {
      delete dbUpdates.activation_date;
    }
    
    // Remove subscription_plan field as it doesn't exist in the database
    if (dbUpdates.subscription_plan !== undefined) {
      delete dbUpdates.subscription_plan;
    }
    
    // Remove email and email_verified fields as they don't exist in the database
    if (dbUpdates.email !== undefined) {
      delete dbUpdates.email;
    }
    
    if (dbUpdates.email_verified !== undefined) {
      delete dbUpdates.email_verified;
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
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
      is_activated: data.activation_complete, // Map from activation_complete to is_activated
      subscription_plan: null, // Default to null since this column doesn't exist yet
      activation_date: null, // Set a default value as it doesn't exist in the database
      email: session.user.email, // Add email from the session
      email_verified: session.user.email_confirmed_at !== null, // Add email verification status
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
