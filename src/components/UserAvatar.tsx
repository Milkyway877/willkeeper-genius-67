
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from '@/contexts/UserProfileContext';
import { UserProfile } from '@/services/profileService';
import { User, Loader2 } from 'lucide-react';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  user?: UserProfile | null;
  loading?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = "", 
  size = "md",
  user,
  loading = false
}) => {
  const { profile, initials } = useUserProfile();
  const displayProfile = user || profile;
  const [imageError, setImageError] = useState(false);
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 text-xs';
      case 'lg': return 'h-24 w-24 text-2xl';
      case 'md':
      default: return 'h-10 w-10 text-sm';
    }
  };
  
  const handleImageError = () => {
    console.log("Avatar image failed to load");
    setImageError(true);
  };
  
  return (
    <Avatar className={`${getSizeClass()} ${className} ring-2 ring-offset-2 ring-offset-white ring-willtank-100`}>
      {displayProfile?.avatar_url && !imageError ? (
        <AvatarImage 
          src={displayProfile.avatar_url} 
          alt={displayProfile.full_name || "User avatar"}
          onError={handleImageError}
        />
      ) : null}
      <AvatarFallback className="bg-gradient-to-r from-willtank-100 to-willtank-200 text-willtank-700 font-semibold">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          initials || <User className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};
