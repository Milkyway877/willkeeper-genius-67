
import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAssistant } from '@/components/ui/FloatingAssistant';
import { Outlet } from 'react-router-dom';

// Add global mobile responsive styles
import './MobileStyles.css';

export default function App() {
  return (
    <NotificationsProvider>
      <Outlet />
      <Toaster />
      <FloatingAssistant />
      <ReactQueryDevtools initialIsOpen={false} />
    </NotificationsProvider>
  );
}
