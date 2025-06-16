
import { useHybridAuth } from '@/contexts/HybridAuthContext';

interface UserAuth {
  user: any;
  loading: boolean;
  displayName: string;
  displayEmail: string;
  initials: string;
}

export const useUserAuth = (): UserAuth => {
  const { user, clerkUser, supabaseProfile, loading } = useHybridAuth();

  // Derive display values from either Clerk or Supabase user
  const displayName = clerkUser?.fullName || 
                     clerkUser?.firstName + ' ' + clerkUser?.lastName ||
                     supabaseProfile?.full_name ||
                     user?.user_metadata?.full_name || 
                     user?.email?.split('@')[0] || 
                     'User';
  
  const displayEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || 
                      user?.email || 
                      supabaseProfile?.email || 
                      '';
  
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(displayName);

  return {
    user: user || clerkUser,
    loading,
    displayName,
    displayEmail,
    initials
  };
};
