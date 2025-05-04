import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import AuthLayout from './components/auth/AuthLayout';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Will from './pages/Will';
import FutureMessages from './pages/FutureMessages';
import LegacyVault from './pages/LegacyVault';
import CheckIns from './pages/CheckIns';
import TestDeathVerificationPage from './pages/TestDeathVerification';
import SearchPage from './pages/SearchPage';

// Add the VerifyTrustedContact route
import VerifyTrustedContact from './pages/VerifyTrustedContact';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/search" element={<SearchPage />} />
        
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/will" element={<Will />} />
        <Route path="/future-messages" element={<FutureMessages />} />
        <Route path="/legacy-vault" element={<LegacyVault />} />
        <Route path="/check-ins" element={<CheckIns />} />
        <Route path="/test-death-verification" element={<TestDeathVerificationPage />} />

        {/* Add the route in your router configuration */}
        <Route
          path: '/verify/trusted-contact/:token',
          element: <VerifyTrustedContact />
        },
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
