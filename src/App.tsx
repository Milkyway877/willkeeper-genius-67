import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

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
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/verify" element={<AccountVerification />} />
            <Route path="/auth/onboarding" element={<Onboarding />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard/*" element={<DashboardLayout />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
