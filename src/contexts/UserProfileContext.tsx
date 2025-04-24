
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { getUserProfile } from '@/services/profileService';

export type Profile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  phone?: string | null;
  background?: string | null;
  template_preference?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  email_verified?: boolean;
  is_activated?: boolean;
};

type UserProfileContextType = {
  profile: Profile | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh the profile data
  const refreshProfile = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session?.user) {
        const userId = sessionData.session.user.id;
        console.log("Fetching updated profile for user:", userId);
        
        const userProfile = await getUserProfile(userId);
        
        if (userProfile) {
          console.log("Profile refreshed successfully:", userProfile);
          setProfile({
            ...userProfile,
            email: sessionData.session.user.email,
            email_verified: sessionData.session.user.email_confirmed_at !== null
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          setError("Failed to fetch user session");
          setIsLoading(false);
          return;
        }
        
        // No active session
        if (!sessionData.session) {
          setProfile(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        setUser(sessionData.session.user);
        
        try {
          const userProfile = await getUserProfile(sessionData.session.user.id);
          
          if (userProfile) {
            setProfile({
              ...userProfile,
              email: sessionData.session.user.email,
              email_verified: sessionData.session.user.email_confirmed_at !== null
            });
          } else {
            console.log("No profile found for user:", sessionData.session.user.id);
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          setError("Failed to fetch user profile data");
        }
      } catch (error) {
        console.error("Unexpected error in profile context:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          refreshProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setUser(null);
        }
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, user, isLoading, error, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  
  return context;
}
