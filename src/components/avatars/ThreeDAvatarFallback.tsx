
'use client';

import React from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { MaleAvatar } from './MaleAvatar';
import { FemaleAvatar } from './FemaleAvatar';

export const ThreeDAvatarFallback = () => {
  const { profile } = useUserProfile();
  const gender = profile?.gender || 'male'; // Default to male if no gender specified

  return gender === 'female' ? <FemaleAvatar /> : <MaleAvatar />;
};
