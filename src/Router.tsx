
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { SignInPage } from '@/pages/auth/SignInPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { RecoverPage } from '@/pages/auth/RecoverPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { WillsPage } from '@/pages/WillsPage';
import { TankPage } from '@/pages/TankPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { DeathVerificationPage } from '@/pages/DeathVerificationPage';
import { TreasuryPage } from '@/pages/TreasuryPage';
import { BillingPage } from '@/pages/BillingPage';
import { WillEditorPage } from '@/pages/will/WillEditorPage';
import { TrialSuccess } from '@/pages/TrialSuccess';

const queryClient = new QueryClient();

export function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/recover" element={<RecoverPage />} />
            <Route path="/trial-success" element={<TrialSuccess />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/wills" element={
              <ProtectedRoute>
                <WillsPage />
              </ProtectedRoute>
            } />
            <Route path="/will/:templateId" element={
              <ProtectedRoute>
                <WillEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/tank" element={
              <ProtectedRoute>
                <TankPage />
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
                <BillingPage />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
