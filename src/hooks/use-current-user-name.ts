
import { useUserProfile } from '@/contexts/UserProfileContext';

export const useCurrentUserName = () => {
  const { profile } = useUserProfile();
  return profile?.full_name || '';
};
