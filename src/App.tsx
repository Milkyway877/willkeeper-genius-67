
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/blog',
  '/help',
  '/search',
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
  '/corporate',
  '/auth/signin',
  '/auth/signup',
  '/auth/verification',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/activate',
  '/auth/verify-email',
  '/auth/callback',
  '/verify',
  '/will-unlock'
];

// Check if a route is public (including dynamic routes)
const isPublicRoute = (pathname: string): boolean => {
  // Exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Dynamic route patterns
  const publicPatterns = [
    /^\/blog\/.*$/,
    /^\/documentation\/.*$/,
    /^\/verify\/.*$/,
    /^\/auth\/.*$/
  ];
  
  return publicPatterns.some(pattern => pattern.test(pathname));
};

function AppContent() {
  const location = useLocation();
  const isPublic = isPublicRoute(location.pathname);
  
  return (
    <Layout forceAuthenticated={!isPublic}>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
