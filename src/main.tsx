
import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "./Router.tsx";
import "./index.css";
import "./MobileStyles.css";
import { ClerkProvider } from '@clerk/clerk-react';

// Your provided Clerk key for preview mode
const PREVIEW_CLERK_KEY = "pk_live_Y2xlcmsud2lsbHRhbmsuY29tJA";

// Get the Clerk publishable key from environment variables or use preview key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || PREVIEW_CLERK_KEY;

// Check if we're in preview/development mode
const isPreviewMode = window.location.hostname.includes('lovableproject.com') || 
                     window.location.hostname === 'localhost';

console.log('Clerk setup:', { 
  hasKey: !!PUBLISHABLE_KEY, 
  isPreviewMode, 
  hostname: window.location.hostname,
  keySource: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'environment' : 'hardcoded'
});

// Always render with ClerkProvider since we now have a key
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router />
    </ClerkProvider>
  </React.StrictMode>,
);
