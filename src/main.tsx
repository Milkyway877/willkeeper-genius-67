
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ClerkProvider } from "@clerk/clerk-react";
import { CLERK_PUBLISHABLE_KEY } from './config/env.ts';
import AppRouter from './Router.tsx';
import { NotificationsProvider } from './contexts/NotificationsContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a query client instance
const queryClient = new QueryClient();

// Check if we have a publishable key
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY}
        appearance={{
          elements: {
            formButtonPrimary: "bg-black hover:bg-gray-800 text-white rounded-xl transition-all duration-200 font-medium",
            formFieldInput: "rounded-lg border-2 border-gray-300",
            footerActionLink: "text-willtank-600 hover:text-willtank-700",
            card: "shadow-none"
          }
        }}
      >
        <NotificationsProvider>
          <AppRouter />
        </NotificationsProvider>
      </ClerkProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
