
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from '@/contexts/UserProfileContext';
import { UserProfile } from '@/services/profileService';
import { User, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  user?: UserProfile | null;
  loading?: boolean;
  cacheBuster?: string | number;
  showFallbackOnError?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = "", 
  size = "md",
  user,
  loading = false,
  cacheBuster = Date.now(), // Use current timestamp as default
  showFallbackOnError = true
}) => {
  const { profile, initials } = useUserProfile();
  const displayProfile = user || profile;
  const [imageError, setImageError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  
  useEffect(() => {
    // Reset states when profile/cacheBuster changes
    setImageError(false);
    setImageLoading(true);
    
    // Update avatar URL with cache busting
    if (displayProfile?.avatar_url) {
      try {
        // Force a new URL to prevent browser caching
        const timestamp = typeof cacheBuster === 'number' ? cacheBuster : Date.now();
        setAvatarUrl(`${displayProfile.avatar_url}?t=${timestamp}`);
      } catch (e) {
        console.error("Error setting avatar URL:", e);
        setImageError(true);
        setImageLoading(false);
      }
    } else {
      setAvatarUrl('');
      setImageLoading(false);
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
    console.error("Avatar image failed to load:", avatarUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log("Avatar image loaded successfully:", avatarUrl);
    setImageLoading(false);
  };
  
  return (
    <Avatar className={`${getSizeClass()} ${className} ring-2 ring-offset-2 ring-offset-white ring-willtank-100`}>
      {avatarUrl && !imageError ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
              <Loader2 className="h-1/3 w-1/3 text-gray-400 animate-spin" />
            </div>
          )}
          <AvatarImage 
            src={avatarUrl}
            alt={displayProfile?.full_name || "User avatar"}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}
          />
        </>
      ) : null}
      <AvatarFallback className="bg-gradient-to-r from-willtank-100 to-willtank-200 text-willtank-700 font-semibold">
        {loading ? (
          <Loader2 className="h-1/3 w-1/3 animate-spin" />
        ) : (
          showFallbackOnError ? (initials || <User className="h-1/2 w-1/2" />) : null
        )}
      </AvatarFallback>
    </Avatar>
  );
};
