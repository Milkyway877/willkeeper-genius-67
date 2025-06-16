
import { useUser } from '@clerk/clerk-react';

interface UserAuth {
  user: any;
  loading: boolean;
  displayName: string;
  displayEmail: string;
  initials: string;
}

export const useUserAuth = (): UserAuth => {
  const { user, isLoaded } = useUser();

  // Derive display values from Clerk user
  const displayName = user?.fullName || 
                     `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
                     user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 
                     'User';
  
  const displayEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(displayName);

  return {
    user,
    loading: !isLoaded,
    displayName,
    displayEmail,
    initials
  };
};
