
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from '@/contexts/UserProfileContext';
import { UserProfile } from '@/services/profileService';
import { User, Loader2 } from 'lucide-react';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  user?: UserProfile | null;
  loading?: boolean;
  cacheBuster?: string | number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = "", 
  size = "md",
  user,
  loading = false,
  cacheBuster
}) => {
  const { profile, initials } = useUserProfile();
  const displayProfile = user || profile;
  const [imageError, setImageError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  useEffect(() => {
    // Reset image error state when profile/cacheBuster changes
    setImageError(false);
    
    // Update avatar URL with cache busting
    if (displayProfile?.avatar_url) {
      const url = new URL(displayProfile.avatar_url);
      if (cacheBuster) {
        url.searchParams.set('t', cacheBuster.toString());
      } else {
        url.searchParams.set('t', Date.now().toString());
      }
      setAvatarUrl(url.toString());
    } else {
      setAvatarUrl('');
    }
  }, [displayProfile, cacheBuster]);
  
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

  // Log for debugging purposes
  useEffect(() => {
    if (displayProfile?.avatar_url) {
      console.log('Avatar URL:', avatarUrl);
    }
  }, [avatarUrl, displayProfile]);
  
  return (
    <Avatar className={`${getSizeClass()} ${className} ring-2 ring-offset-2 ring-offset-white ring-willtank-100`}>
      {avatarUrl && !imageError ? (
        <AvatarImage 
          src={avatarUrl}
          alt={displayProfile?.full_name || "User avatar"}
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
