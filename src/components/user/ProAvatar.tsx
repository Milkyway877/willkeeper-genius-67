
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserAuth } from '@/hooks/useUserAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { User, Crown } from 'lucide-react';

interface ProAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCrown?: boolean;
}

export const ProAvatar: React.FC<ProAvatarProps> = ({ 
  className = "", 
  size = "md",
  showCrown = true
}) => {
  const { initials } = useUserAuth();
  const { subscriptionStatus } = useSubscriptionStatus();
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 text-xs';
      case 'lg': return 'h-24 w-24 text-2xl';
      case 'md':
      default: return 'h-10 w-10 text-sm';
    }
  };

  const getCrownSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-6 w-6';
      case 'md':
      default: return 'h-4 w-4';
    }
  };
  
  return (
    <div className="relative">
      <Avatar className={`${getSizeClass()} ${className} ring-2 ring-offset-2 ring-offset-white ${
        subscriptionStatus.isSubscribed ? 'ring-yellow-400' : 'ring-willtank-100'
      }`}>
        <AvatarFallback className={`${
          subscriptionStatus.isSubscribed 
            ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700' 
            : 'bg-gradient-to-r from-willtank-100 to-willtank-200 text-willtank-700'
        } font-semibold`}>
          {initials || <User className="h-1/2 w-1/2" />}
        </AvatarFallback>
      </Avatar>
      
      {showCrown && subscriptionStatus.isSubscribed && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-white shadow-lg">
          <Crown className={`${getCrownSize()} text-white`} />
        </div>
      )}
    </div>
  );
};
