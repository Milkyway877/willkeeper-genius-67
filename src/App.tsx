
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

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
import NotFound from '@/pages/NotFound';
import AccountVerification from '@/pages/auth/AccountVerification';
import Onboarding from '@/pages/auth/Onboarding';

// Layout Components
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Additional pages
import IDSecurity from '@/pages/security/IDSecurity';
import AIAssistance from '@/pages/ai/AIAssistance';
import Encryption from '@/pages/encryption/Encryption';
import Executors from '@/pages/executors/Executors';
import Billing from '@/pages/billing/Billing';
import Help from '@/pages/Help';
import Templates from '@/pages/templates/Templates';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="willtank-theme">
      <UserProfileProvider>
        <NotificationsProvider>
          <SidebarProvider>
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
                      
                      {/* Will routes */}
                      <Route path="will" element={<Wills />} />
                      <Route path="will/create" element={<CreateWill />} />
                      <Route path="will/edit/:id" element={<EditWill />} />
                      <Route path="will/view/:id" element={<ViewWill />} />
                      
                      {/* Messages routes */}
                      <Route path="messages" element={<FutureMessages />} />
                      <Route path="messages/create" element={<CreateMessage />} />
                      <Route path="messages/edit/:id" element={<EditMessage />} />
                      <Route path="messages/view/:id" element={<ViewMessage />} />
                      
                      {/* Vault routes */}
                      <Route path="vault" element={<LegacyVault />} />
                      <Route path="vault/create" element={<CreateVaultItem />} />
                      <Route path="vault/edit/:id" element={<EditVaultItem />} />
                      <Route path="vault/view/:id" element={<ViewVaultItem />} />
                      
                      {/* Additional routes */}
                      <Route path="encryption" element={<Encryption />} />
                      <Route path="executors" element={<Executors />} />
                      <Route path="ai-assistance" element={<AIAssistance />} />
                      <Route path="id-security" element={<IDSecurity />} />
                      <Route path="templates" element={<Templates />} />
                      <Route path="billing" element={<Billing />} />
                      <Route path="help" element={<Help />} />
                    </Route>
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </SidebarProvider>
        </NotificationsProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;
