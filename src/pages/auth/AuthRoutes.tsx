
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SecureSignIn from './SecureSignIn';
import SecureSignUp from './SecureSignUp';
import SecureRecover from './SecureRecover';
import AuthResetPassword from './ResetPassword';
import AccountActivation from './AccountActivation';
import EmailVerification from './EmailVerification';
import VerifyEmailBanner from './VerifyEmailBanner';
import AuthCallback from './AuthCallback';

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={<SecureSignIn />} />
      <Route path="/signup" element={<SecureSignUp />} />
      <Route path="/verification" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<SecureRecover />} />
      <Route path="/reset-password" element={<AuthResetPassword />} />
      <Route path="/activate" element={<AccountActivation />} />
      <Route path="/verify-email" element={<VerifyEmailBanner />} />
      <Route path="/callback" element={<AuthCallback />} />
    </Routes>
  );
}
