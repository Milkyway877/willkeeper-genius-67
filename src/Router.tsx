import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import Recover from '@/pages/auth/Recover';
import ResetPassword from '@/pages/auth/ResetPassword';
import SecurePasswordReset from '@/pages/auth/SecurePasswordReset';
import TwoFactorVerification from '@/pages/auth/TwoFactorVerification';
import Dashboard from '@/pages/Dashboard';
import Wills from '@/pages/wills/Wills';
import Tank from '@/pages/tank/Tank';
import ContactsPage from '@/pages/ContactsPage';
import DeathVerificationPage from '@/pages/DeathVerificationPage';
import TreasuryPage from '@/pages/TreasuryPage';
import Billing from '@/pages/billing/Billing';
import WillEditorPage from '@/pages/will/WillEditorPage';
import IDSecurity from '@/pages/security/IDSecurity';
import { TrialSuccess } from '@/pages/TrialSuccess';
import EnhancedExecutorLogin from '@/pages/will-unlock/EnhancedExecutorLogin';

const queryClient = new QueryClient();

export function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/recover" element={<Recover />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/secure-password-reset" element={<SecurePasswordReset />} />
            <Route path="/auth/2fa-verification" element={<TwoFactorVerification />} />
            <Route path="/trial-success" element={<TrialSuccess />} />
            <Route path="/pricing" element={<Billing />} />
            <Route path="/security/IDSecurity" element={
              <ProtectedRoute>
                <IDSecurity />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/wills" element={
              <ProtectedRoute>
                <Wills />
              </ProtectedRoute>
            } />
            <Route path="/will/:templateId" element={
              <ProtectedRoute>
                <WillEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/tank" element={
              <ProtectedRoute>
                <Tank />
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <ContactsPage />
              </ProtectedRoute>
            } />
            <Route path="/death-verification" element={
              <ProtectedRoute>
                <DeathVerificationPage />
              </ProtectedRoute>
            } />
            <Route path="/treasury" element={
              <ProtectedRoute>
                <TreasuryPage />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/executor-access" element={<EnhancedExecutorLogin />} />
          </Routes>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
