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
    console.log('getUserProfile: Starting profile fetch...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('getUserProfile: No session found');
      return null;
    }
    
    console.log('getUserProfile: Fetching profile for user:', session.user.id);
    
    let { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      console.error('getUserProfile: Error fetching profile:', error);
      
      // If profile doesn't exist, try to create it
      if (error.code === 'PGRST116') {
        console.log('getUserProfile: Profile not found, attempting to create...');
        try {
          await createUserProfile(session.user);
          // Try fetching again after creation
          const { data: newData, error: newError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (newError) {
            console.error('getUserProfile: Error fetching newly created profile:', newError);
            return null;
          }
          data = newData;
        } catch (createError) {
          console.error('getUserProfile: Failed to create profile:', createError);
          return null;
        }
      } else {
        return null;
      }
    }
    
    const profile = {
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
    
    console.log('getUserProfile: Successfully fetched profile:', profile);
    return profile;
  } catch (error) {
    console.error('getUserProfile: Unexpected error:', error);
    return null;
  }
};

export const createUserProfile = async (user: User): Promise<void> => {
  try {
    console.log('createUserProfile: Creating profile for user:', user.id);
    
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
      console.error('createUserProfile: Error creating profile:', error);
      throw error;
    }
    
    console.log('createUserProfile: Profile created successfully');
  } catch (error) {
    console.error('createUserProfile: Unexpected error:', error);
    throw error;
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    console.log('updateUserProfile: Starting update with:', updates);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('No user logged in');
    }

    // First, check if profile exists and handle duplicates
    const { data: existingProfiles, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id);

    if (checkError) {
      console.error('updateUserProfile: Error checking existing profiles:', checkError);
      throw new Error(`Failed to check existing profile: ${checkError.message}`);
    }

    // Handle multiple profiles (cleanup duplicates)
    if (existingProfiles && existingProfiles.length > 1) {
      console.warn('updateUserProfile: Multiple profiles found, cleaning up duplicates');
      // Keep the first one, delete the rest
      const keepProfile = existingProfiles[0];
      const duplicateIds = existingProfiles.slice(1).map(p => p.id);
      
      if (duplicateIds.length > 0) {
        await supabase
          .from('user_profiles')
          .delete()
          .in('id', duplicateIds);
        console.log('updateUserProfile: Cleaned up duplicate profiles');
      }
    }

    // If no profile exists, create one first
    if (!existingProfiles || existingProfiles.length === 0) {
      console.log('updateUserProfile: No profile found, creating one first');
      await createUserProfile(session.user);
    }

    // Create a clean updates object for database
    const dbUpdates: any = {};
    
    // Map frontend fields to database fields
    if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name;
    if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.is_activated !== undefined) dbUpdates.activation_complete = updates.is_activated;
    
    // Always update the timestamp
    dbUpdates.updated_at = new Date().toISOString();
    
    console.log('updateUserProfile: Database updates:', dbUpdates);
    
    // Use upsert to handle edge cases
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: session.user.id,
        email: session.user.email,
        ...dbUpdates
      })
      .select()
      .single();
      
    if (error) {
      console.error('updateUserProfile: Database error:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from profile update');
    }
    
    const updatedProfile = {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_activated: data.activation_complete || false,
      subscription_plan: data.subscription_plan || 'Free Plan',
      activation_date: data.activation_date || null,
      email: session.user.email,
      email_verified: session.user.email_confirmed_at !== null,
      gender: data.gender || null,
    };
    
    console.log('updateUserProfile: Successfully updated profile:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('updateUserProfile: Error:', error);
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
