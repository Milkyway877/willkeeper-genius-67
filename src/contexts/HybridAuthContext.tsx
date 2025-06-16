
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
  const { isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthSync = async () => {
      setLoading(true);
      
      try {
        if (isSignedIn && clerkUser) {
          console.log('Syncing Clerk user to Supabase:', clerkUser.id);
          
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
          console.log('No Clerk user found, clearing state');
          setUser(null);
          setSupabaseProfile(null);
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
  }, [isSignedIn, clerkUser]);

  const signOut = async () => {
    console.log('Signing out user');
    await clerkSignOut();
    setUser(null);
    setSupabaseProfile(null);
  };

  const isAuthenticated = isSignedIn;

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
