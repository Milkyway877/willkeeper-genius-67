
import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, getInitials } from "@/services/profileService";
import { logUserActivity } from "@/services/activityService";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  gender?: 'male' | 'female';
  is_activated: boolean | null;
  email_verified: boolean | null;
  subscription_plan: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfileContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initials: string;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  profile: null,
  loading: true,
  initials: "U",
  refreshProfile: async () => {}
});

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initials, setInitials] = useState("U");
  const [prevAuthState, setPrevAuthState] = useState<User | null>(null);

  const refreshProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setInitials(getInitials(userProfile.full_name));
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          logUserActivity('login', { 
            email: session.user.email,
            method: 'password' // or other auth method
          });
        }
        
        if (event === 'SIGNED_OUT' && prevAuthState) {
          logUserActivity('logout', { 
            email: prevAuthState.email 
          });
        }
        
        setPrevAuthState(user);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          refreshProfile();
        } else {
          setProfile(null);
          setInitials("U");
        }
      }
    );
    
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setUser(session?.user ?? null);
        setPrevAuthState(session?.user ?? null);
        
        if (session?.user) {
          await refreshProfile();
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (profile?.full_name) {
      setInitials(getInitials(profile.full_name));
    } else if (user?.email) {
      setInitials(user.email.substring(0, 1).toUpperCase());
    } else {
      setInitials("U");
    }
  }, [profile, user]);

  const value = {
    user,
    profile,
    loading,
    initials,
    refreshProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
