
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ClerkProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, userId, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
};
