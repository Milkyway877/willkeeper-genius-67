
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./MobileStyles.css";
import { ClerkProvider } from '@clerk/clerk-react';

// Get the Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// In preview/development mode, we might not have the key - handle gracefully
const isPreviewMode = window.location.hostname.includes('lovableproject.com') || 
                     window.location.hostname === 'localhost';

if (!PUBLISHABLE_KEY && !isPreviewMode) {
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.");
}

console.log('Clerk setup:', { 
  hasKey: !!PUBLISHABLE_KEY, 
  isPreviewMode, 
  hostname: window.location.hostname 
});

// Conditional wrapper for Clerk
const AppWrapper = () => {
  if (PUBLISHABLE_KEY) {
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    );
  }
  
  // In preview mode without a key, render app without Clerk
  return <App />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
);
