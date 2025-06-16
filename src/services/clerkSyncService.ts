
import { supabase } from '@/integrations/supabase/client';
import { User } from '@clerk/clerk-react';

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string; id: string }>;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
}

export const syncClerkUserToSupabase = async (clerkUser: ClerkUser) => {
  try {
    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
    
    if (!primaryEmail) {
      console.error('No primary email found for Clerk user');
      return;
    }

    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_id', clerkUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', checkError);
      return;
    }

    const profileData = {
      clerk_id: clerkUser.id,
      email: primaryEmail,
      first_name: clerkUser.firstName || null,
      last_name: clerkUser.lastName || null,
      full_name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      avatar_url: clerkUser.imageUrl || null,
      updated_at: new Date().toISOString(),
    };

    if (!existingProfile) {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
          activation_complete: true,
          onboarding_completed: false,
          verification_status: 'verified'
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
      } else {
        console.log('User profile created successfully for Clerk user:', clerkUser.id);
      }
    } else {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('clerk_id', clerkUser.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      } else {
        console.log('User profile updated successfully for Clerk user:', clerkUser.id);
      }
    }
  } catch (error) {
    console.error('Error syncing Clerk user to Supabase:', error);
  }
};

export const getSupabaseUserByClerkId = async (clerkId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Supabase user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting Supabase user by Clerk ID:', error);
    return null;
  }
};
