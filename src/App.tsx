
import React, { useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useUser } from "@clerk/clerk-react";

function App() {
  const location = useLocation();
  const { user, isLoaded } = useUser();
  
  // Log page views for analytics
  useEffect(() => {
    if (location.pathname) {
      console.log(`Page viewed: ${location.pathname}`);
    }
  }, [location.pathname]);

  // Log when user state changes
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        console.log("User is authenticated:", user.id);
      } else {
        console.log("User is not authenticated");
      }
    }
  }, [user, isLoaded]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="willtank-theme">
      <TooltipProvider>
        <Outlet />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
