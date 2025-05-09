
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProfile, useAuth } from "@clerk/clerk-react";
import { AuthLayout } from './components/auth/AuthLayout';
import { ClerkProtectedRoute } from './components/auth/ClerkProtectedRoute';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import API from './pages/API';
import FAQ from './pages/FAQ';
import VerifyTrustedContact from './pages/VerifyTrustedContact';
import SignInPage from './pages/auth/SignIn';
import SignUpPage from './pages/auth/SignUp';
import VerifyEmail from './pages/auth/VerifyEmail';

// Import Clerk user profile component
import { UserProfile as ClerkUserProfile } from "@clerk/clerk-react";

// Create placeholder pages for development
const Home = () => <Index />;
const About = () => <div>About Page</div>;
const Pricing = () => <div>Pricing Page</div>;
const Terms = () => <div>Terms Page</div>;
const Privacy = () => <div>Privacy Page</div>;
const Help = () => <div>Help Center</div>;
const NotFoundPage = () => <NotFound />;
const Dashboard = () => <div>Dashboard Page</div>;
const Settings = () => <div>Settings Page</div>;
const Will = () => <div>Will Page</div>;
const FutureMessages = () => <div>Future Messages Page</div>;
const LegacyVault = () => <div>Legacy Vault Page</div>;
const CheckIns = () => <div>Check-Ins Page</div>;
const TestDeathVerificationPage = () => <div>Test Death Verification Page</div>;
const SearchPage = () => <div>Search Page</div>;

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
        
        {/* Standardized Authentication Routes */}
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        
        {/* Email Verification Routes */}
        <Route path="/auth/verify-email-address" element={<VerifyEmail />} />
        <Route path="/auth/signup/verify-email-address" element={<VerifyEmail />} />
        
        {/* Redirect old auth routes to new ones */}
        <Route path="/sign-in" element={<Navigate to="/auth/signin" replace />} />
        <Route path="/sign-up" element={<Navigate to="/auth/signup" replace />} />
        
        <Route path="/user-profile" element={
          <ClerkProtectedRoute>
            <ClerkUserProfile routing="path" path="/user-profile" />
          </ClerkProtectedRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ClerkProtectedRoute>
            <Dashboard />
          </ClerkProtectedRoute>
        } />
        <Route path="/settings" element={
          <ClerkProtectedRoute>
            <Settings />
          </ClerkProtectedRoute>
        } />
        <Route path="/will" element={
          <ClerkProtectedRoute>
            <Will />
          </ClerkProtectedRoute>
        } />
        <Route path="/future-messages" element={
          <ClerkProtectedRoute>
            <FutureMessages />
          </ClerkProtectedRoute>
        } />
        <Route path="/legacy-vault" element={
          <ClerkProtectedRoute>
            <LegacyVault />
          </ClerkProtectedRoute>
        } />
        <Route path="/check-ins" element={
          <ClerkProtectedRoute>
            <CheckIns />
          </ClerkProtectedRoute>
        } />
        <Route path="/test-death-verification" element={
          <ClerkProtectedRoute>
            <TestDeathVerificationPage />
          </ClerkProtectedRoute>
        } />

        <Route
          path="/verify/trusted-contact/:token"
          element={<VerifyTrustedContact />}
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
