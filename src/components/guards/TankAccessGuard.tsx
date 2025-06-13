
import React from 'react';

interface TankAccessGuardProps {
  children: React.ReactNode;
}

// Remove all barriers - allow free Tank access during creation phase
export const TankAccessGuard: React.FC<TankAccessGuardProps> = ({ children }) => {
  // Simply render children without any restrictions during creation
  return <>{children}</>;
};
