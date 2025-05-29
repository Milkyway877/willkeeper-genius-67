
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserAuth } from '@/hooks/useUserAuth';
import { User } from 'lucide-react';

interface SimpleAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ 
  className = "", 
  size = "md" 
}) => {
  const { initials } = useUserAuth();
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 text-xs';
      case 'lg': return 'h-24 w-24 text-2xl';
      case 'md':
      default: return 'h-10 w-10 text-sm';
    }
  };
  
  return (
    <Avatar className={`${getSizeClass()} ${className} ring-2 ring-offset-2 ring-offset-white ring-willtank-100`}>
      <AvatarFallback className="bg-gradient-to-r from-willtank-100 to-willtank-200 text-willtank-700 font-semibold">
        {initials || <User className="h-1/2 w-1/2" />}
      </AvatarFallback>
    </Avatar>
  );
};
