
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/dashboard/Profile';
import Settings from '@/pages/settings/Settings';
import Security from '@/pages/dashboard/Security';
import CreateWill from '@/pages/dashboard/CreateWill';
import EditWill from '@/pages/dashboard/EditWill';
import ViewWill from '@/pages/dashboard/ViewWill';
import LegacyVault from '@/pages/dashboard/LegacyVault';
import CreateVaultItem from '@/pages/dashboard/CreateVaultItem';
import EditVaultItem from '@/pages/dashboard/EditVaultItem';
import ViewVaultItem from '@/pages/dashboard/ViewVaultItem';
import NotFound from '@/pages/NotFound';
import AccountVerification from '@/pages/auth/AccountVerification';
import Onboarding from '@/pages/auth/Onboarding';
import Will from '@/pages/will/Will';
import Encryption from '@/pages/encryption/Encryption';
import Executors from '@/pages/executors/Executors';
import IDSecurity from '@/pages/security/IDSecurity';
import Tank from '@/pages/tank/Tank';
import Billing from '@/pages/billing/Billing';
import Corporate from '@/pages/Corporate';
import Help from '@/pages/Help';
import Documentation from '@/pages/corporate/Documentation';

// Layout Components
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="willtank-theme">
        <UserProfileProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes - No auth required */}
                <Route path="/" element={<Index />} />
                <Route path="/help" element={<Help />} />
                
                {/* Auth Routes */}
                <Route path="/auth">
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="verify" element={<AccountVerification />} />
                  <Route element={<RouteGuard requireAuth={true} requireOnboarding={false} />}>
                    <Route path="onboarding" element={<Onboarding />} />
                  </Route>
                </Route>
                
                {/* Corporate Pages */}
                <Route path="/corporate" element={<Corporate />} />
                <Route path="/corporate/documentation" element={<Documentation />} />
                
                {/* Protected Dashboard Routes */}
                <Route element={<RouteGuard requireAuth={true} requireOnboarding={true} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="/pages/encryption/Encryption" element={<Encryption />} />
                    <Route path="/pages/executors/Executors" element={<Executors />} />
                    <Route path="/pages/security/IDSecurity" element={<IDSecurity />} />
                    <Route path="/tank" element={<Tank />} />
                    <Route path="/pages/billing/Billing" element={<Billing />} />
                    <Route path="/corporate" element={<Corporate />} />
                    <Route path="/vault" element={<LegacyVault />} />
                    <Route path="/vault/create" element={<CreateVaultItem />} />
                    <Route path="/vault/edit/:id" element={<EditVaultItem />} />
                    <Route path="/vault/view/:id" element={<ViewVaultItem />} />
                    <Route path="/help" element={<Help />} />
                  </Route>
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </UserProfileProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
