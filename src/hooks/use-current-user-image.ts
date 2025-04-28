
import { useUserProfile } from '@/contexts/UserProfileContext';

export const useCurrentUserImage = () => {
  const { profile } = useUserProfile();
  return profile?.avatar_url || null;
};
