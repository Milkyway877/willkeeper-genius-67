
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AuthProvider } from '@/hooks/use-auth';

// Public Pages
import Index from '@/pages/Index';
import SignUp from '@/pages/auth/SignUp';
import SignIn from '@/pages/auth/SignIn';
import Recover from '@/pages/auth/Recover';
import ResetPassword from '@/pages/auth/ResetPassword';
import EmailVerification from '@/pages/auth/EmailVerification';
import AuthCallback from '@/pages/auth/AuthCallback';
import VerifyEmailBanner from '@/pages/auth/VerifyEmailBanner';

// Protected Pages
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
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionChecked(true);
    };

    checkSession();
  }, []);

  if (!sessionChecked && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-willtank-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="willtank-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <main>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Auth Routes */}
              <Route path="/auth">
                <Route path="signup" element={<SignUp />} />
                <Route path="signin" element={<SignIn />} />
                <Route path="recover" element={<Recover />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="verify-email" element={<EmailVerification />} />
                <Route path="auth-callback" element={<AuthCallback />} />
              </Route>
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
