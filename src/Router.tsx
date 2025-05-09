
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProfile, SignIn, SignUp, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { ClerkProtectedRoute } from './components/auth/ClerkProtectedRoute';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import API from './pages/API';
import FAQ from './pages/FAQ';
import VerifyTrustedContact from './pages/VerifyTrustedContact';
import VerifyEmail from './pages/auth/VerifyEmail';

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

// Define Clerk Components for routes
const SignInPage = () => (
  <ClerkLoading>
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  </ClerkLoading>
  <ClerkLoaded>
    <SignIn redirectUrl="/dashboard" />
  </ClerkLoaded>
);

const SignUpPage = () => (
  <ClerkLoading>
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  </ClerkLoading>
  <ClerkLoaded>
    <SignUp redirectUrl="/dashboard" />
  </ClerkLoaded>
);

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
        
        {/* Direct routes for Clerk's default paths */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Redirect legacy auth routes to Clerk's default paths */}
        <Route path="/auth/signin" element={<Navigate to="/sign-in" replace />} />
        <Route path="/auth/signup" element={<Navigate to="/sign-up" replace />} />
        <Route path="/auth/verify-email-address" element={<Navigate to="/verify-email" replace />} />
        <Route path="/auth/signup/verify-email-address" element={<Navigate to="/verify-email" replace />} />
        
        {/* Let Clerk handle all auth routes */}
        <Route path="/user-profile" element={
          <ClerkProtectedRoute>
            <UserProfile />
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
