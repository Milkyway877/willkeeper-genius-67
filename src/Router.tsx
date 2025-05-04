
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { AuthLayout } from './components/auth/AuthLayout';
import AuthCallback from './pages/auth/AuthCallback';
import VerifyTrustedContact from './pages/VerifyTrustedContact';
import EmailVerification from './pages/auth/EmailVerification';
import VerifyEmailBanner from './pages/auth/VerifyEmailBanner';
import { Layout } from './components/layout/Layout';

// Create placeholder pages for development
const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Pricing = () => <div>Pricing Page</div>;
const Contact = () => <div>Contact Page</div>;
const Faq = () => <div>FAQ Page</div>;
const Terms = () => <div>Terms Page</div>;
const Privacy = () => <div>Privacy Page</div>;
const NotFound = () => <div>404 Not Found</div>;
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

// Dashboard layout wrapper that doesn't force authentication for verification pages
const DashboardLayoutWrapper = ({ requireAuth = true }) => {
  return (
    <Layout forceAuthenticated={requireAuth}>
      <Outlet />
    </Layout>
  );
};

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
        
        {/* Auth routes - don't force auth for these */}
        <Route element={<AuthLayoutWrapper />}>
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/verification" element={<EmailVerification />} />
          <Route path="/auth/verify-email" element={<VerifyEmailBanner />} />
        </Route>
        
        {/* Protected routes - require authentication */}
        <Route element={<DashboardLayoutWrapper />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/will" element={<Will />} />
          <Route path="/future-messages" element={<FutureMessages />} />
          <Route path="/legacy-vault" element={<LegacyVault />} />
          <Route path="/check-ins" element={<CheckIns />} />
          <Route path="/test-death-verification" element={<TestDeathVerificationPage />} />
        </Route>
        
        <Route
          path="/verify/trusted-contact/:token"
          element={<VerifyTrustedContact />}
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
