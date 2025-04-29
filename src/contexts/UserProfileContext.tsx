
import React, { createContext, useState, useEffect, useContext } from "react";
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
}

const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  profile: null,
  loading: true,
  initials: "U",
  refreshProfile: async () => {},
  updateEmail: async () => ({ success: false }),
  updateProfile: async () => null
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshProfile = async () => {
    try {
      if (!user) return;
      
      console.log("Refreshing profile for user:", user.id);
      const userProfile = await getUserProfile();
      
      if (userProfile) {
        console.log("Profile refreshed successfully:", userProfile);
        setProfile(userProfile);
        setInitials(getInitials(userProfile.full_name));
        // Force a refresh of any components using the profile
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.warn("No profile found during refresh");
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast({
        title: "Profile Error",
        description: "Could not refresh your profile information.",
        variant: "destructive"
      });
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
        // Force a refresh of any components using the profile
        setRefreshTrigger(prev => prev + 1);
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
      
      // Use Supabase auth directly with better error handling
      const { data, error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (error) {
        console.error("Error updating email with Supabase:", error);
        throw error;
      }
      
      if (data) {
        console.log("Email update initiated successfully:", data);
        
        // Log the activity
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
    // Check for existing session first
    const checkUser = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Found existing session for user:", session.user.id);
          setUser(session.user);
          setPrevAuthState(session.user);
          await refreshProfile();
        } else {
          console.log("No active session found");
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Then set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("User signed in:", session.user.id);
          setUser(session.user);
          setPrevAuthState(session.user);
          
          // Log user sign in
          logUserActivity('login', { 
            email: session.user.email,
            method: 'password' // or other auth method
          });
          
          // Load profile after auth state changes
          refreshProfile();
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setUser(null);
          setProfile(null);
          setInitials("U");
          
          // Log user sign out
          if (prevAuthState) {
            logUserActivity('logout', { 
              email: prevAuthState.email 
            });
          }
        } else if (event === 'USER_UPDATED' && session?.user) {
          console.log("User updated:", session.user.id);
          setUser(session.user);
          refreshProfile();
        }
      }
    );
    
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
    refreshProfile,
    updateEmail,
    updateProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
