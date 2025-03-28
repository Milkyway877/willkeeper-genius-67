
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from '@/contexts/UserProfileContext';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = "", 
  size = "md" 
}) => {
  const { profile, initials } = useUserProfile();
  
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
      {profile?.avatar_url && (
        <AvatarImage 
          src={profile.avatar_url} 
          alt={profile.full_name || "User avatar"} 
        />
      )}
      <AvatarFallback className="bg-willtank-100 text-willtank-700 font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
