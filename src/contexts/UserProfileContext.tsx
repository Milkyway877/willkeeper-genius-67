
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './AuthContext';
import { getUserProfile as fetchUserProfile } from '@/services/profileService';
import { getInitials } from '@/services/profileService';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  is_activated: boolean | null;
  subscription_plan: string | null;
  activation_date: string | null;
  email_verified: boolean | null;
  created_at?: string | null;
  metadata?: {
    location?: string;
    bio?: string;
    [key: string]: any;
  };
}

interface UserProfileContextType {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  user: any;
  refreshProfile: () => Promise<void>;
  initials: string; // Add this missing property
}

const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  setProfile: () => {},
  loading: true,
  user: null,
  refreshProfile: async () => {},
  initials: 'U' // Set a default value
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Calculate initials from profile name
  const initials = profile?.full_name ? getInitials(profile.full_name) : 'U';

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userProfile = await fetchUserProfile();
      
      if (userProfile) {
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [user]);

  useEffect(() => {
    // Listen for auth changes to refresh profile
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') {
          refreshProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserProfileContext.Provider value={{ 
      profile, 
      setProfile, 
      loading, 
      user, 
      refreshProfile,
      initials // Pass the calculated initials
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserProfileContext);
