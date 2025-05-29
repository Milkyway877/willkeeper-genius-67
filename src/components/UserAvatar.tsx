
import React from 'react';
import { SimpleAvatar } from '@/components/user/SimpleAvatar';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  cacheBuster?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = (props) => {
  return <SimpleAvatar {...props} />;
};
