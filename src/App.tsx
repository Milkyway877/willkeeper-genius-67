
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

// Public Pages
import Index from '@/pages/Index';

// Protected Pages - will need to be updated once new auth system is implemented
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

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="willtank-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <main>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Dashboard Routes - these will need auth protection once new auth system is implemented */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="security" element={<Security />} />
                <Route path="notifications" element={<Notifications />} />
                
                {/* Will Management */}
                <Route path="wills">
                  <Route index element={<Wills />} />
                  <Route path="create" element={<CreateWill />} />
                  <Route path="edit/:id" element={<EditWill />} />
                  <Route path="view/:id" element={<ViewWill />} />
                </Route>
                
                {/* Future Messages */}
                <Route path="messages">
                  <Route index element={<FutureMessages />} />
                  <Route path="create" element={<CreateMessage />} />
                  <Route path="edit/:id" element={<EditMessage />} />
                  <Route path="view/:id" element={<ViewMessage />} />
                </Route>
                
                {/* Legacy Vault */}
                <Route path="vault">
                  <Route index element={<LegacyVault />} />
                  <Route path="create" element={<CreateVaultItem />} />
                  <Route path="edit/:id" element={<EditVaultItem />} />
                  <Route path="view/:id" element={<ViewVaultItem />} />
                </Route>
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
