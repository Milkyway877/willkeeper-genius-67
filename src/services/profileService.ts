
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
  email: string | null;
  email_verified: boolean | null;
  gender?: 'male' | 'female' | null; // Optional gender field
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
    
    const profile: UserProfile = {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_activated: data.activation_complete, // Map from activation_complete to is_activated
      subscription_plan: data.subscription_plan || 'Free Plan', // Default to 'Free Plan'
      activation_date: data.activation_date,
      email: session.user.email, // Add email from the session
      email_verified: session.user.email_confirmed_at !== null, // Add email verification status
      gender: data.gender || null, // Add gender if available
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
    
    const dbUpdates: any = {...updates};
    
    if (updates.is_activated !== undefined) {
      dbUpdates.activation_complete = updates.is_activated;
      delete dbUpdates.is_activated;
    }
    
    // These fields should not be sent to the database
    delete dbUpdates.activation_date;
    delete dbUpdates.subscription_plan;
    delete dbUpdates.email;
    delete dbUpdates.email_verified;
    
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
    
    const profile: UserProfile = {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_activated: data.activation_complete, // Map from activation_complete to is_activated
      subscription_plan: data.subscription_plan || 'Free Plan', // Default to 'Free Plan'
      activation_date: data.activation_date || null, // Set a default value as it might not exist in the database
      email: session.user.email, // Add email from the session
      email_verified: session.user.email_confirmed_at !== null, // Add email verification status
      gender: data.gender || null, // Add gender if available
    };
    
    return profile;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

export const uploadProfileImage = async (file: File): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No user logged in');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update the user profile with the new avatar URL
    await updateUserProfile({
      avatar_url: publicUrl
    });

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
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
