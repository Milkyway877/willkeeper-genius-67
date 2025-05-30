import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthCheck } from '@/components/auth/AuthCheck';
import { TankLayout } from '@/components/tank/TankLayout';
import { MissedCheckinMonitor } from '@/components/death-verification/MissedCheckinMonitor';
import { NotificationProvider } from '@/components/ui/providers/notification-provider';

import SecureSignUp from '@/pages/auth/SecureSignUp';
import SecureSignIn from '@/pages/auth/SecureSignIn';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import ImpersonateUser from '@/pages/admin/ImpersonateUser';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import TestDeathVerification from '@/pages/TestDeathVerification';
import WillUnlockPage from '@/pages/WillUnlockPage';
import ExecutorAccessPage from '@/pages/ExecutorAccessPage';
import VerifyTrustedContact from '@/pages/VerifyTrustedContact';
import VerifyBeneficiary from '@/pages/VerifyBeneficiary';
import VerifyContactInvitation from '@/pages/VerifyContactInvitation';

import AccountPage from '@/pages/tank/AccountPage';
import DashboardPage from '@/pages/tank/DashboardPage';
import WillPage from '@/pages/tank/WillPage';
import DocumentsPage from '@/pages/tank/DocumentsPage';
import ContactsPage from '@/pages/tank/ContactsPage';
import SettingsPage from '@/pages/tank/SettingsPage';
import SubscriptionPage from '@/pages/tank/SubscriptionPage';
import CheckinPage from '@/pages/tank/CheckinPage';
import SimpleWillUnlock from '@/pages/will-unlock/SimpleWillUnlock';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/signup" element={<SecureSignUp />} />
          <Route path="/auth/signin" element={<SecureSignIn />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          
          {/* Legacy Verification Routes (redirect to unified) */}
          <Route path="/verify/trusted-contact/:token" element={<VerifyTrustedContact />} />
          <Route path="/verify/beneficiary/:token" element={<VerifyBeneficiary />} />
          
          {/* Unified Invitation Verification */}
          <Route path="/verify/invitation/:token" element={<VerifyContactInvitation />} />

          {/* Admin Routes - Requires Authentication and Admin Role */}
          <Route path="/admin" element={<AuthCheck roles={['admin']}><AdminDashboard /></AuthCheck>} />
          <Route path="/admin/impersonate/:userId" element={<AuthCheck roles={['admin']}><ImpersonateUser /></AuthCheck>} />

          {/* Testing and Development Routes */}
          <Route path="/test/death-verification" element={<TestDeathVerification />} />

          {/* Will unlock routes */}
          <Route path="/will-unlock" element={<SimpleWillUnlock />} />
          <Route path="/will-unlock/:requestId" element={<WillUnlockPage />} />
          <Route path="/executor-access" element={<ExecutorAccessPage />} />
          
          {/* Authenticated User Routes - Requires Authentication */}
          <Route path="/" element={<AuthCheck><TankLayout><DashboardPage /></TankLayout></AuthCheck>} />
          <Route path="/account" element={<AuthCheck><TankLayout><AccountPage /></TankLayout></AuthCheck>} />
          <Route path="/will" element={<AuthCheck><TankLayout><WillPage /></TankLayout></AuthCheck>} />
          <Route path="/documents" element={<AuthCheck><TankLayout><DocumentsPage /></TankLayout></AuthCheck>} />
          <Route path="/contacts" element={<AuthCheck><TankLayout><ContactsPage /></TankLayout></AuthCheck>} />
          <Route path="/settings" element={<AuthCheck><TankLayout><SettingsPage /></TankLayout></AuthCheck>} />
          <Route path="/subscription" element={<AuthCheck><TankLayout><SubscriptionPage /></TankLayout></AuthCheck>} />
          <Route path="/checkin" element={<AuthCheck><TankLayout><CheckinPage /></TankLayout></AuthCheck>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <NotificationProvider />
      <MissedCheckinMonitor />
    </QueryClientProvider>
  );
}

export default App;
