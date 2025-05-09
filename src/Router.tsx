
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { AuthLayout } from './components/auth/AuthLayout';
import AuthCallback from './pages/auth/AuthCallback';
import VerifyTrustedContact from './pages/VerifyTrustedContact';
import VerificationResponse from './pages/verify/VerificationResponse';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import API from './pages/API';
import FAQ from './pages/FAQ';

// Create placeholder pages for development
const Home = () => <Index />;
const About = () => <div>About Page</div>;
const Pricing = () => <div>Pricing Page</div>;
const Terms = () => <div>Terms Page</div>;
const Privacy = () => <div>Privacy Page</div>;
const Help = () => <div>Help Center</div>;
const NotFoundPage = () => <NotFound />;
const SignIn = () => <div>Sign In Page</div>;
const SignUp = () => <div>Sign Up Page</div>;
const ForgotPassword = () => <div>Forgot Password Page</div>;
const ResetPassword = () => <div>Reset Password Page</div>;
const Dashboard = () => <div>Dashboard Page</div>;
const Settings = () => <div>Settings Page</div>;
const Will = () => <div>Will Page</div>;
const FutureMessages = () => <div>Future Messages Page</div>;
const LegacyVault = () => <div>Legacy Vault Page</div>;
const CheckIns = () => <div>Check-Ins Page</div>;
const TestDeathVerificationPage = () => <div>Test Death Verification Page</div>;
const SearchPage = () => <div>Search Page</div>;

// Auth layout wrapper component that passes children to AuthLayout
const AuthLayoutWrapper = () => {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/api" element={<API />} />
        <Route path="/help" element={<Help />} />
        
        {/* Fix the AuthLayout route by using AuthLayoutWrapper */}
        <Route element={<AuthLayoutWrapper />}>
          <Route path="/auth" element={<SignIn />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/will" element={<Will />} />
        <Route path="/future-messages" element={<FutureMessages />} />
        <Route path="/legacy-vault" element={<LegacyVault />} />
        <Route path="/check-ins" element={<CheckIns />} />
        <Route path="/test-death-verification" element={<TestDeathVerificationPage />} />

        {/* Verification routes */}
        <Route
          path="/verify/trusted-contact/:token"
          element={<VerifyTrustedContact />}
        />
        <Route
          path="/verify/invitation/:token"
          element={<VerificationResponse />}
        />
        <Route
          path="/verify/status/:token"
          element={<VerificationResponse />}
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
