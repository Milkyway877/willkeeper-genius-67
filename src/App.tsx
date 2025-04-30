
import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { Outlet } from 'react-router-dom';

// Add global mobile responsive styles
import './MobileStyles.css';

export default function App() {
  return (
    <>
      <Outlet />
      <Toaster />
      <FloatingAssistant />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
