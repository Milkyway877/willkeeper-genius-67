
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { syncClerkUserToSupabase, getSupabaseUserByClerkId } from '@/services/clerkSyncService';

interface HybridAuthContextType {
  user: SupabaseUser | null;
  clerkUser: any;
  supabaseProfile: any;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const HybridAuthContext = createContext<HybridAuthContextType | undefined>(undefined);

export function HybridAuthProvider({ children }: { children: React.ReactNode }) {
  // Check if Clerk is available
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Conditionally use Clerk hooks only if Clerk is available
  const clerkAuth = CLERK_PUBLISHABLE_KEY ? useClerkAuth() : { isSignedIn: false, signOut: async () => {} };
  const clerkUserData = CLERK_PUBLISHABLE_KEY ? useUser() : { user: null };
  
  const { isSignedIn, signOut: clerkSignOut } = clerkAuth;
  const { user: clerkUser } = clerkUserData;
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthSync = async () => {
      setLoading(true);
      
      try {
        if (CLERK_PUBLISHABLE_KEY && isSignedIn && clerkUser) {
          // Sync Clerk user to Supabase
          await syncClerkUserToSupabase(clerkUser);
          
          // Get the synced Supabase profile
          const supabaseProfile = await getSupabaseUserByClerkId(clerkUser.id);
          setSupabaseProfile(supabaseProfile);
          
          // Create a mock Supabase user object for compatibility
          const mockSupabaseUser: SupabaseUser = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            user_metadata: {
              first_name: clerkUser.firstName,
              last_name: clerkUser.lastName,
              full_name: clerkUser.fullName,
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
            updated_at: clerkUser.updatedAt?.toISOString() || new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            phone: '',
            confirmation_sent_at: null,
            confirmed_at: null,
            last_sign_in_at: null,
            role: 'authenticated',
            factors: []
          };
          
          setUser(mockSupabaseUser);
        } else {
          // Check for existing Supabase session (fallback)
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Get Supabase profile for non-Clerk users
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setSupabaseProfile(profile);
          } else {
            setSupabaseProfile(null);
          }
        }
      } catch (error) {
        console.error('Error in auth sync:', error);
        setUser(null);
        setSupabaseProfile(null);
      } finally {
        setLoading(false);
      }
    };

    handleAuthSync();
  }, [CLERK_PUBLISHABLE_KEY, isSignedIn, clerkUser]);

  // Listen for Supabase auth changes (fallback for non-Clerk users)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!CLERK_PUBLISHABLE_KEY || !isSignedIn) {
          setUser(session?.user ?? null);
          if (session?.user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setSupabaseProfile(profile);
          } else {
            setSupabaseProfile(null);
          }
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [CLERK_PUBLISHABLE_KEY, isSignedIn]);

  const signOut = async () => {
    if (CLERK_PUBLISHABLE_KEY && isSignedIn) {
      await clerkSignOut();
    } else {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSupabaseProfile(null);
  };

  const isAuthenticated = (CLERK_PUBLISHABLE_KEY && isSignedIn) || !!user;

  return (
    <HybridAuthContext.Provider value={{ 
      user, 
      clerkUser, 
      supabaseProfile, 
      loading, 
      signOut, 
      isAuthenticated 
    }}>
      {children}
    </HybridAuthContext.Provider>
  );
}

export function useHybridAuth() {
  const context = useContext(HybridAuthContext);
  if (context === undefined) {
    throw new Error('useHybridAuth must be used within a HybridAuthProvider');
  }
  return context;
}
