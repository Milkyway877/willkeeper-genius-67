
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from '@/contexts/UserProfileContext';
import { UserProfile } from '@/services/profileService';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  user?: UserProfile | null;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = "", 
  size = "md",
  user
}) => {
  const { profile, initials } = useUserProfile();
  const displayProfile = user || profile;
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 text-xs';
      case 'lg': return 'h-14 w-14 text-xl';
      case 'md':
      default: return 'h-10 w-10 text-sm';
    }
  };
  
  return (
    <Avatar className={`${getSizeClass()} ${className}`}>
      {displayProfile?.avatar_url && (
        <AvatarImage 
          src={displayProfile.avatar_url} 
          alt={displayProfile.full_name || "User avatar"} 
        />
      )}
      <AvatarFallback className="bg-willtank-100 text-willtank-700 font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
