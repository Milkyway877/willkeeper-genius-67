
import React from 'react';
import { ProAvatar } from '@/components/user/ProAvatar';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  cacheBuster?: number;
  showCrown?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = (props) => {
  return <ProAvatar {...props} />;
};
