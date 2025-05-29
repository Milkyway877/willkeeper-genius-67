
import React from 'react';
import { useUserAuth } from '@/hooks/useUserAuth';

interface UserDisplayProps {
  showEmail?: boolean;
  className?: string;
}

export const UserDisplay: React.FC<UserDisplayProps> = ({ 
  showEmail = true, 
  className = "" 
}) => {
  const { displayName, displayEmail } = useUserAuth();

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="font-semibold">{displayName}</span>
      {showEmail && (
        <span className="text-xs text-gray-500 truncate">{displayEmail}</span>
      )}
    </div>
  );
};
