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
  gender?: 'male' | 'female' | null;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('No session found in getUserProfile');
      return null;
    }
    
    console.log('Fetching profile for user:', session.user.id);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      
      // If profile doesn't exist, try to create it
      if (error.code === 'PGRST116') {
        console.log('Profile not found, attempting to create...');
        await createUserProfile(session.user);
        // Try fetching again after creation
        const { data: newData, error: newError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (newError) {
          console.error('Error fetching newly created profile:', newError);
          return null;
        }
        data = newData;
      } else {
        return null;
      }
    }
    
    return {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_activated: data.activation_complete || false,
      subscription_plan: data.subscription_plan || 'Free Plan',
      activation_date: data.activation_date,
      email: session.user.email,
      email_verified: session.user.email_confirmed_at !== null,
      gender: data.gender || null,
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const createUserProfile = async (user: User): Promise<void> => {
  try {
    console.log('Creating profile for user:', user.id);
    
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activation_complete: false,
    };
    
    const { error } = await supabase
      .from('user_profiles')
      .insert(profileData);
      
    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    
    console.log('User profile created successfully');
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    throw error;
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
    
    return {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_activated: data.activation_complete,
      subscription_plan: data.subscription_plan || 'Free Plan',
      activation_date: data.activation_date || null,
      email: session.user.email,
      email_verified: session.user.email_confirmed_at !== null,
      gender: data.gender || null,
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (file: File): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No user logged in');
    }

    // Generate a unique filename with timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Log for debugging
    console.log('Uploading file:', fileName);
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '0', // No cache
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Add cache busting parameter
    const cacheBustedUrl = `${publicUrl}?t=${timestamp}`;
    
    console.log('Avatar uploaded successfully:', publicUrl);

    // Update the user profile with the new avatar URL
    await updateUserProfile({
      avatar_url: publicUrl // Store the original URL in the database
    });

    return cacheBustedUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    throw error;
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
