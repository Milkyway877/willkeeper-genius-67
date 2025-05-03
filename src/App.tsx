
import React from 'react';
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { NotificationsProvider } from './contexts/NotificationsContext';

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
