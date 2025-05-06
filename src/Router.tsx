
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { AuthLayout } from './components/auth/AuthLayout';
import AuthCallback from './pages/auth/AuthCallback';
import VerifyTrustedContact from './pages/VerifyTrustedContact';
import { Layout } from './components/layout/Layout';
import Index from './pages/Index';

// Create pages that will be accessible without authentication
const Home = () => <Layout forceAuthenticated={false}><div>Home Page</div></Layout>;
const About = () => <Layout forceAuthenticated={false}><div>About Page</div></Layout>;
const Pricing = () => <Layout forceAuthenticated={false}><div>Pricing Page</div></Layout>;
const Contact = () => <Layout forceAuthenticated={false}><div>Contact Page</div></Layout>;
const Faq = () => <Layout forceAuthenticated={false}><div>FAQ Page</div></Layout>;
const Terms = () => <Layout forceAuthenticated={false}><div>Terms Page</div></Layout>;
const Privacy = () => <Layout forceAuthenticated={false}><div>Privacy Page</div></Layout>;
const NotFound = () => <Layout forceAuthenticated={false}><div>404 Not Found</div></Layout>;
const SearchPage = () => <Layout forceAuthenticated={false}><div>Search Page</div></Layout>;

// These pages still require authentication
const Dashboard = () => <Layout forceAuthenticated={true}><div>Dashboard Page</div></Layout>;
const Settings = () => <Layout forceAuthenticated={true}><div>Settings Page</div></Layout>;
const Will = () => <Layout forceAuthenticated={true}><div>Will Page</div></Layout>;
const FutureMessages = () => <Layout forceAuthenticated={true}><div>Future Messages Page</div></Layout>;
const LegacyVault = () => <Layout forceAuthenticated={true}><div>Legacy Vault Page</div></Layout>;
const CheckIns = () => <Layout forceAuthenticated={true}><div>Check-Ins Page</div></Layout>;
const TestDeathVerificationPage = () => <Layout forceAuthenticated={true}><div>Test Death Verification Page</div></Layout>;

// Auth pages
const SignIn = () => <div>Sign In Page</div>;
const SignUp = () => <div>Sign Up Page</div>;
const ForgotPassword = () => <div>Forgot Password Page</div>;
const ResetPassword = () => <div>Reset Password Page</div>;

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
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/search" element={<SearchPage />} />
        
        {/* Auth routes - no authentication required */}
        <Route element={<AuthLayoutWrapper />}>
          <Route path="/auth" element={<SignIn />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>
        
        {/* Protected routes - require authentication */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/will" element={<Will />} />
        <Route path="/future-messages" element={<FutureMessages />} />
        <Route path="/legacy-vault" element={<LegacyVault />} />
        <Route path="/check-ins" element={<CheckIns />} />
        <Route path="/test-death-verification" element={<TestDeathVerificationPage />} />

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
