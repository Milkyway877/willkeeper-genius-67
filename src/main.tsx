
import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "./Router.tsx";
import "./index.css";
import "./MobileStyles.css";
import { ClerkProvider } from '@clerk/clerk-react';

// Get the Clerk publishable key from environment variables with fallback
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_live_Y2xlcmsud2lsbHRhbmsuY29tJA";

// Check if we're in preview/development mode
const isPreviewMode = window.location.hostname.includes('lovableproject.com') || 
                     window.location.hostname === 'localhost';

console.log('Clerk setup:', { 
  hasKey: !!PUBLISHABLE_KEY, 
  isPreviewMode, 
  hostname: window.location.hostname,
  keySource: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'environment' : 'fallback'
});

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Create root element
const root = ReactDOM.createRoot(document.getElementById("root")!);

// Render app with error boundary
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router />
    </ClerkProvider>
  </React.StrictMode>
);
