
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error refreshing session:", error);
        return;
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      setIsLoading(true);
      
      // Initial session fetch
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error("Error in initial auth setup:", error);
      } finally {
        setIsLoading(false);
      }
      
      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log("Auth state changed:", event, newSession?.user?.email);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsLoading(false);
        }
      );
      
      return () => {
        authListener?.subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
