
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

import SecureSignUp from '@/pages/auth/SecureSignUp';
import SecureSignIn from '@/pages/auth/SecureSignIn';
import ResetPassword from '@/pages/auth/ResetPassword';
import TestDeathVerification from '@/pages/TestDeathVerification';
import SimpleWillUnlock from '@/pages/will-unlock/SimpleWillUnlock';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/signup" element={<SecureSignUp />} />
          <Route path="/auth/signin" element={<SecureSignIn />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          
          {/* Testing and Development Routes */}
          <Route path="/test/death-verification" element={<TestDeathVerification />} />
          <Route path="/test-death-verification" element={<TestDeathVerification />} />

          {/* Will unlock routes */}
          <Route path="/will-unlock" element={<SimpleWillUnlock />} />
          
          {/* Default route */}
          <Route path="/" element={<TestDeathVerification />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
