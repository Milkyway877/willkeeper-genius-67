
import React from 'react';
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsProvider } from './contexts/NotificationsContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <RouterProvider router={router} />
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
