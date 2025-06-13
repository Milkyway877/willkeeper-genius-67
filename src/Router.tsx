
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import Recover from '@/pages/auth/Recover';
import Dashboard from '@/pages/Dashboard';
import Wills from '@/pages/wills/Wills';
import Tank from '@/pages/tank/Tank';
import ContactsPage from '@/pages/ContactsPage';
import DeathVerificationPage from '@/pages/DeathVerificationPage';
import TreasuryPage from '@/pages/TreasuryPage';
import Pricing from '@/pages/Pricing';
import WillEditorPage from '@/pages/will/WillEditorPage';
import TemplateWillCreationPage from '@/pages/will/TemplateWillCreationPage';
import { TrialSuccess } from '@/pages/TrialSuccess';

const queryClient = new QueryClient();

export function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/recover" element={<Recover />} />
              <Route path="/trial-success" element={<TrialSuccess />} />
              <Route path="/pricing" element={<Pricing />} />
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
              <Route path="/will/template-creation/:templateId" element={
                <ProtectedRoute>
                  <TemplateWillCreationPage />
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
                  <Pricing />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
            <Sonner />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
