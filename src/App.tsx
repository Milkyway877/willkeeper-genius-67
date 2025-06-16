
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router-dom';
import { HybridAuthProvider } from '@/contexts/HybridAuthContext';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <HybridAuthProvider>
        <Outlet />
        <Toaster />
      </HybridAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
