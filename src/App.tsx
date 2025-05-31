
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
