
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { RouteGuard } from '@/components/auth/RouteGuard';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import Dashboard from '@/pages/dashboard/Dashboard';
import Profile from '@/pages/dashboard/Profile';
import Settings from '@/pages/dashboard/Settings';
import Security from '@/pages/dashboard/Security';
import Notifications from '@/pages/dashboard/Notifications';
import Wills from '@/pages/dashboard/Wills';
import CreateWill from '@/pages/dashboard/CreateWill';
import EditWill from '@/pages/dashboard/EditWill';
import ViewWill from '@/pages/dashboard/ViewWill';
import FutureMessages from '@/pages/dashboard/FutureMessages';
import CreateMessage from '@/pages/dashboard/CreateMessage';
import EditMessage from '@/pages/dashboard/EditMessage';
import ViewMessage from '@/pages/dashboard/ViewMessage';
import LegacyVault from '@/pages/dashboard/LegacyVault';
import CreateVaultItem from '@/pages/dashboard/CreateVaultItem';
import EditVaultItem from '@/pages/dashboard/EditVaultItem';
import ViewVaultItem from '@/pages/dashboard/ViewVaultItem';

// Layout Components
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AccountVerification from '@/pages/auth/AccountVerification';
import Onboarding from '@/pages/auth/Onboarding';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="willtank-theme">
      <UserProfileProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              
              {/* Auth Routes */}
              <Route path="/auth">
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="verify" element={<AccountVerification />} />
                <Route path="onboarding" element={
                  <RouteGuard requireAuth={true} requireOnboarding={false}>
                    <Onboarding />
                  </RouteGuard>
                } />
              </Route>
              
              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <RouteGuard requireAuth={true} requireOnboarding={true}>
                    <DashboardLayout />
                  </RouteGuard>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="security" element={<Security />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="wills" element={<Wills />} />
                <Route path="wills/create" element={<CreateWill />} />
                <Route path="wills/edit/:id" element={<EditWill />} />
                <Route path="wills/view/:id" element={<ViewWill />} />
                <Route path="messages" element={<FutureMessages />} />
                <Route path="messages/create" element={<CreateMessage />} />
                <Route path="messages/edit/:id" element={<EditMessage />} />
                <Route path="messages/view/:id" element={<ViewMessage />} />
                <Route path="vault" element={<LegacyVault />} />
                <Route path="vault/create" element={<CreateVaultItem />} />
                <Route path="vault/edit/:id" element={<EditVaultItem />} />
                <Route path="vault/view/:id" element={<ViewVaultItem />} />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </Router>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;
