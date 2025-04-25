
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
import Dashboard from '@/pages/Dashboard'; 
import Profile from '@/pages/settings/Profile';
import Settings from '@/pages/settings/Settings';
import Security from '@/pages/dashboard/Security';
import Notifications from '@/pages/notifications/Notifications';
import Wills from '@/pages/wills/Wills';
import CreateWill from '@/pages/will/WillCreation';
import EditWill from '@/pages/will/WillCreation';
import ViewWill from '@/pages/will/Will';
import FutureMessages from '@/pages/tank/Tank';
import CreateMessage from '@/pages/tank/TankCreation';
import EditMessage from '@/pages/tank/TankCreation';
import ViewMessage from '@/pages/tank/Tank';
import LegacyVault from '@/pages/tank/components/TankLegacyVault';
import CreateVaultItem from '@/pages/tank/components/vault/AddVaultItem';
import EditVaultItem from '@/pages/tank/components/vault/AddVaultItem';
import ViewVaultItem from '@/pages/tank/components/vault/VaultItem';
import NotFound from '@/pages/NotFound';
import AccountVerification from '@/pages/auth/AccountVerification';
import Onboarding from '@/pages/auth/Onboarding';
import Templates from '@/pages/templates/Templates';

// Layout Components
import DashboardLayout from '@/components/layouts/DashboardLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="willtank-theme">
      <UserProfileProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes - No auth required */}
              <Route path="/" element={<Index />} />
              
              {/* Auth Routes */}
              <Route path="/auth">
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="verify" element={<AccountVerification />} />
                {/* Onboarding route - requires auth but not onboarding completion */}
                <Route element={<RouteGuard requireAuth={true} requireOnboarding={false} />}>
                  <Route path="onboarding" element={<Onboarding />} />
                </Route>
              </Route>
              
              {/* Protected Dashboard Routes */}
              <Route element={<RouteGuard requireAuth={true} requireOnboarding={true} />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="security" element={<Security />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="wills" element={<Wills />} />
                  <Route path="wills/create" element={<CreateWill />} />
                  <Route path="wills/edit/:id" element={<EditWill />} />
                  <Route path="wills/view/:id" element={<ViewWill />} />
                  <Route path="templates" element={<Templates />} />
                  <Route path="messages" element={<FutureMessages />} />
                  <Route path="messages/create" element={<CreateMessage />} />
                  <Route path="messages/edit/:id" element={<EditMessage />} />
                  <Route path="messages/view/:id" element={<ViewMessage />} />
                  <Route path="vault" element={<LegacyVault />} />
                  <Route path="vault/create" element={<CreateVaultItem />} />
                  <Route path="vault/edit/:id" element={<EditVaultItem />} />
                  <Route path="vault/view/:id" element={<ViewVaultItem />} />
                </Route>
              </Route>
              
              {/* Additional Routes */}
              <Route path="/will/create" element={<CreateWill />} />
              <Route path="/will/edit/:id" element={<EditWill />} />
              <Route path="/will/view/:id" element={<ViewWill />} />
              <Route path="/will/new" element={<CreateWill />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;
