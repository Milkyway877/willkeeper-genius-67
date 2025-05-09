
import { useUser, useAuth } from "@clerk/clerk-react";

export function useClerkUser() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  
  // Return a consistent interface to our user data
  return {
    user,
    isLoaded,
    isSignedIn,
    profile: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      email_verified: user.primaryEmailAddress?.verification?.status === 'verified',
      avatar_url: user.imageUrl,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    } : null,
  };
}
