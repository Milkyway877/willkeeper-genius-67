import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, getInitials, type UserProfile, updateUserProfile } from "@/services/profileService";
import { logUserActivity } from "@/services/activityService";
import { useToast } from '@/hooks/use-toast';

interface UserProfileContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initials: string;
  refreshProfile: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  displayName: string;
  displayEmail: string;
}

const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  profile: null,
  loading: true,
  initials: "U",
  refreshProfile: async () => {},
  updateEmail: async () => ({ success: false }),
  updateProfile: async () => null,
  displayName: "User",
  displayEmail: ""
});

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initials, setInitials] = useState("U");
  const [prevAuthState, setPrevAuthState] = useState<User | null>(null);
  const isRefreshing = useRef(false);

  // Derived values with proper fallbacks
  const displayName = profile?.full_name || 
                     user?.user_metadata?.full_name || 
                     user?.email?.split('@')[0] || 
                     "User";
  
  const displayEmail = profile?.email || user?.email || "";

  const refreshProfile = async () => {
    if (!user || isRefreshing.current) {
      console.log('refreshProfile: Skipping - no user or already refreshing');
      return;
    }
    
    try {
      isRefreshing.current = true;
      console.log("refreshProfile: Starting profile refresh for user:", user.id);
      
      const userProfile = await getUserProfile();
      
      if (userProfile) {
        console.log("refreshProfile: Profile refreshed successfully:", userProfile);
        setProfile(userProfile);
        setInitials(getInitials(userProfile.full_name));
      } else {
        console.warn("refreshProfile: No profile found, using session fallbacks");
        // Use user data as fallback
        setInitials(getInitials(user?.user_metadata?.full_name || user?.email));
      }
    } catch (error) {
      console.error("refreshProfile: Error refreshing profile:", error);
      // Use user data as fallback on error
      setInitials(getInitials(user?.user_metadata?.full_name || user?.email));
      toast({
        title: "Profile Error",
        description: "Could not refresh your profile information.",
        variant: "destructive"
      });
    } finally {
      isRefreshing.current = false;
      console.log("refreshProfile: Completed, setting loading to false");
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("You must be logged in to update your profile");
      }
      
      console.log("Updating profile with:", updates);
      const updatedProfile = await updateUserProfile(updates);
      
      if (updatedProfile) {
        console.log("Profile updated successfully:", updatedProfile);
        setProfile(updatedProfile);
        setInitials(getInitials(updatedProfile.full_name));
        return updatedProfile;
      } else {
        throw new Error("Failed to update profile");
      }
      
      return null;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update your profile information",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateEmail = async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      if (!newEmail || newEmail.trim() === '') {
        throw new Error("Email address is required");
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        throw new Error("Please enter a valid email address");
      }
      
      if (user.email === newEmail) {
        return { success: false, error: "This is already your current email address" };
      }
      
      console.log("Updating email to:", newEmail);
      
      const { data, error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (error) {
        console.error("Error updating email with Supabase:", error);
        throw error;
      }
      
      if (data) {
        console.log("Email update initiated successfully:", data);
        
        await logUserActivity('email_update', { 
          previous_email: user?.email,
          new_email: newEmail
        });
        
        return { success: true };
      } else {
        throw new Error("No response from authentication service");
      }
    } catch (error: any) {
      console.error("Error updating email:", error);
      return { 
        success: false, 
        error: error.message || "Failed to update email" 
      };
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("checkUser: Checking for existing session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("checkUser: Found existing session for user:", session.user.id);
          setUser(session.user);
          setPrevAuthState(session.user);
          
          // Set immediate fallback values from session
          const fallbackName = session.user.user_metadata?.full_name || session.user.email;
          setInitials(getInitials(fallbackName));
          
          // Load the full profile (only once)
          if (!isRefreshing.current) {
            await refreshProfile();
          }
        } else {
          console.log("checkUser: No active session found");
          setUser(null);
          setProfile(null);
          setInitials("U");
        }
      } catch (error) {
        console.error("checkUser: Error checking user session:", error);
      } finally {
        console.log("checkUser: Setting loading to false");
        setLoading(false);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("User signed in:", session.user.id);
          setUser(session.user);
          setPrevAuthState(session.user);
          
          // Set immediate fallback values
          const fallbackName = session.user.user_metadata?.full_name || session.user.email;
          setInitials(getInitials(fallbackName));
          
          await logUserActivity('login', { 
            email: session.user.email,
            method: 'password'
          });
          
          // Load profile after sign in
          await refreshProfile();
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setUser(null);
          setProfile(null);
          setInitials("U");
          isRefreshing.current = false;
          
          if (prevAuthState) {
            await logUserActivity('logout', { 
              email: prevAuthState.email 
            });
          }
        } else if (event === 'USER_UPDATED' && session?.user) {
          console.log("User updated:", session.user.id);
          setUser(session.user);
          const fallbackName = session.user.user_metadata?.full_name || session.user.email;
          setInitials(getInitials(fallbackName));
          await refreshProfile();
        }
        
        console.log("Auth state change: Setting loading to false");
        setLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update initials when profile or user changes
  useEffect(() => {
    if (profile?.full_name) {
      setInitials(getInitials(profile.full_name));
    } else if (user?.user_metadata?.full_name) {
      setInitials(getInitials(user.user_metadata.full_name));
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
    refreshProfile,
    updateEmail,
    updateProfile,
    displayName,
    displayEmail
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
