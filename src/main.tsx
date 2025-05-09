
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from "@clerk/clerk-react";
import { CLERK_PUBLISHABLE_KEY } from './config/env.ts';
import AppRouter from './Router.tsx';
import { NotificationsProvider } from './contexts/NotificationsContext.tsx';

// Check if we have a publishable key
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <NotificationsProvider>
        <AppRouter />
      </NotificationsProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
