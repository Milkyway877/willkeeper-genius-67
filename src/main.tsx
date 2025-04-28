
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { Toaster } from 'sonner';

// Create a client for React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <App />
        <Toaster position="bottom-right" richColors />
      </NotificationsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
