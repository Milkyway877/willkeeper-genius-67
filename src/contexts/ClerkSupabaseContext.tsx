
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logUserActivity } from '@/services/activityService';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email_verified: boolean;
  is_activated?: boolean;
  created_at: string;
  updated_at: string;
}

interface ClerkSupabaseContextType {
  user: any; // Clerk user object
  profile: UserProfile | null;
  loading: boolean;
  initials: string;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
}

const ClerkSupabaseContext = createContext<ClerkSupabaseContextType>({
  user: null,
  profile: null,
  loading: true,
  initials: "U",
  refreshProfile: async () => {},
  updateProfile: async () => null,
  signOut: async () => {},
});

export const getInitials = (fullName: string): string => {
  if (!fullName) return "U";
  
  const names = fullName.split(' ').filter(Boolean);
  if (names.length === 0) return "U";
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const ClerkSupabaseProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isLoaded: isClerkLoaded, userId, getToken } = useAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initials, setInitials] = useState("U");
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async () => {
    if (!userId || !clerkUser) return null;

    try {
      // Get JWT token from Clerk
      const token = await getToken({ template: "supabase" });
      
      // Set auth token for this request
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', userError);
        return null;
      }

      if (!userData) {
        // Create new profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            clerk_id: userId,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            first_name: clerkUser.firstName || '',
            last_name: clerkUser.lastName || '',
            full_name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            avatar_url: clerkUser.imageUrl,
            email_verified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
            is_activated: true,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }

        return newProfile;
      }

      return userData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Effect to sync Clerk auth state with Supabase
  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!isClerkLoaded || !isUserLoaded) {
        return;
      }

      setLoading(true);

      try {
        if (userId && clerkUser) {
          const userProfile = await fetchUserProfile();
          
          if (userProfile) {
            setProfile(userProfile);
            setInitials(getInitials(userProfile.full_name));
            
            // Log user activity
            await logUserActivity('login', { 
              email: userProfile.email,
              method: 'clerk' 
            });
          }
        } else {
          setProfile(null);
          setInitials("U");
        }
      } catch (error) {
        console.error('Error syncing user with Supabase:', error);
        toast({
          title: "Authentication Error",
          description: "There was a problem with your authentication. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    syncUserWithSupabase();
  }, [isClerkLoaded, isUserLoaded, userId, clerkUser, refreshCounter]);

  // Function to refresh the user profile
  const refreshProfile = async () => {
    setRefreshCounter(prev => prev + 1);
  };

  // Function to update user profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!userId || !profile) {
      throw new Error("You must be logged in to update your profile");
    }

    try {
      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('clerk_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error(error.message);
      }

      setProfile(updatedProfile);
      if (updatedProfile.full_name) {
        setInitials(getInitials(updatedProfile.full_name));
      }
      
      return updatedProfile;
    } catch (error: any) {
      console.error('Error in updateProfile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update your profile",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Function to sign out from both Clerk and clean up Supabase state
  const signOut = async () => {
    try {
      // If we have a user profile, log the logout activity
      if (profile) {
        await logUserActivity('logout', { 
          email: profile.email 
        });
      }
      
      // Clear local profile state
      setProfile(null);
      setInitials("U");
      
      // Clerk will handle the signout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const contextValue = {
    user: clerkUser,
    profile,
    loading: loading || !isClerkLoaded || !isUserLoaded,
    initials,
    refreshProfile,
    updateProfile,
    signOut,
  };

  return (
    <ClerkSupabaseContext.Provider value={contextValue}>
      {children}
    </ClerkSupabaseContext.Provider>
  );
};

export const useClerkSupabase = () => useContext(ClerkSupabaseContext);
