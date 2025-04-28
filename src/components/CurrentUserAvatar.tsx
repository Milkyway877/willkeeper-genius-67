
'use client';

import { useCurrentUserImage } from '@/hooks/use-current-user-image';
import { useCurrentUserName } from '@/hooks/use-current-user-name';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThreeDAvatarFallback } from './avatars/ThreeDAvatarFallback';
import { Suspense } from 'react';

export const CurrentUserAvatar = () => {
  const profileImage = useCurrentUserImage();
  const name = useCurrentUserName();
  const initials = name
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase() || '';

  return (
    <Avatar>
      {profileImage && <AvatarImage src={profileImage} alt={name || 'User avatar'} />}
      <AvatarFallback>
        <Suspense fallback={initials}>
          <ThreeDAvatarFallback />
        </Suspense>
      </AvatarFallback>
    </Avatar>
  );
};
