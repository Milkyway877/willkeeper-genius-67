
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

function App() {
  const location = useLocation();
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/pricing',
    '/blog',
    '/help',
    '/how-it-works',
    '/security',
    '/services',
    '/business',
    '/privacy',
    '/terms',
    '/cookies',
    '/documentation',
    '/api',
    '/faq',
    '/careers',
    '/community',
    '/gdpr'
  ];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname === route || 
    location.pathname.startsWith('/auth/') ||
    location.pathname.startsWith('/blog/') ||
    location.pathname.startsWith('/documentation/')
  );
  
  return (
    <QueryClientProvider client={new QueryClient()}>
      {isPublicRoute ? (
        <Outlet />
      ) : (
        <Layout forceAuthenticated={true}>
          <Outlet />
        </Layout>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
